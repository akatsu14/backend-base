import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  fullName: string;
  username: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;

  // friends system
  friends: mongoose.Types.ObjectId[]; // confirmed friends
  friendRequestsReceived: mongoose.Types.ObjectId[]; // incoming requests
  friendRequestsSent: mongoose.Types.ObjectId[]; // outgoing requests

  // existing method
  matchPassword(enteredPassword: string): Promise<boolean>;

  // instance methods for friend flow
  sendFriendRequest(toUserId: string): Promise<void>;
  acceptFriendRequest(fromUserId: string): Promise<void>;
  cancelFriendRequest(toUserId: string): Promise<void>;
  removeFriend(friendId: string): Promise<void>;
}

interface IUserModel extends mongoose.Model<IUser> {
  getFriendSuggestions(userId: string, limit?: number): Promise<any[]>;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, "Please add a full name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    lowercase: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please add a valid email",
    // ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 5,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Friends system fields
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friendRequestsReceived: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friendRequestsSent: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Hash password before saving
userSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password")) {
    // don't hash or proceed further for password; still update updatedAt
    this.updatedAt = new Date();
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = new Date();
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: send friend request
userSchema.methods.sendFriendRequest = async function (
  this: IUser,
  toUserId: string
): Promise<void> {
  const User = this.model("User") as mongoose.Model<IUser>;
  if (this._id.equals(toUserId))
    throw new Error("Cannot send friend request to yourself");

  const toUser = await User.findById(toUserId);
  if (!toUser) throw new Error("User not found");

  // Already friends
  if (
    this.friends.some((f) => f.equals(toUser._id)) ||
    toUser.friends.some((f) => f.equals(this._id))
  ) {
    throw new Error("Already friends");
  }

  // Request already sent/received
  if (this.friendRequestsSent.some((f) => f.equals(toUser._id)))
    throw new Error("Friend request already sent");
  if (this.friendRequestsReceived.some((f) => f.equals(toUser._id)))
    throw new Error("User has sent you a request");

  // push request
  toUser.friendRequestsReceived.push(this._id);
  this.friendRequestsSent.push(toUser._id);

  await Promise.all([toUser.save(), this.save()]);
};

// Instance method: accept friend request
userSchema.methods.acceptFriendRequest = async function (
  this: IUser,
  fromUserId: string
): Promise<void> {
  const User = this.model("User") as mongoose.Model<IUser>;
  const fromUser = await User.findById(fromUserId);
  if (!fromUser) throw new Error("User not found");

  const receivedIndex = this.friendRequestsReceived.findIndex((id) =>
    id.equals(fromUser._id)
  );
  if (receivedIndex === -1) throw new Error("No friend request from this user");

  // remove request entries
  this.friendRequestsReceived.splice(receivedIndex, 1);
  const sentIndex = fromUser.friendRequestsSent.findIndex((id) =>
    id.equals(this._id)
  );
  if (sentIndex !== -1) fromUser.friendRequestsSent.splice(sentIndex, 1);

  // add to friends if not already
  if (!this.friends.some((f) => f.equals(fromUser._id)))
    this.friends.push(fromUser._id);
  if (!fromUser.friends.some((f) => f.equals(this._id)))
    fromUser.friends.push(this._id);

  await Promise.all([this.save(), fromUser.save()]);
};

// Instance method: cancel (withdraw) a sent friend request
userSchema.methods.cancelFriendRequest = async function (
  this: IUser,
  toUserId: string
): Promise<void> {
  const User = this.model("User") as mongoose.Model<IUser>;
  const toUser = await User.findById(toUserId);
  if (!toUser) throw new Error("User not found");

  const sentIndex = this.friendRequestsSent.findIndex((id) =>
    id.equals(toUser._id)
  );
  if (sentIndex === -1) throw new Error("No sent friend request to this user");

  this.friendRequestsSent.splice(sentIndex, 1);
  const receivedIndex = toUser.friendRequestsReceived.findIndex((id) =>
    id.equals(this._id)
  );
  if (receivedIndex !== -1)
    toUser.friendRequestsReceived.splice(receivedIndex, 1);

  await Promise.all([this.save(), toUser.save()]);
};

// Instance method: remove friend
userSchema.methods.removeFriend = async function (
  this: IUser,
  friendId: string
): Promise<void> {
  const User = this.model("User") as mongoose.Model<IUser>;
  const friend = await User.findById(friendId);
  if (!friend) throw new Error("User not found");

  this.friends = this.friends.filter((id) => !id.equals(friend._id));
  friend.friends = friend.friends.filter((id) => !id.equals(this._id));

  await Promise.all([this.save(), friend.save()]);
};

// Static: suggest friends ordered by number of mutual friends
userSchema.statics.getFriendSuggestions = async function (
  userId: string,
  limit = 10
) {
  const objectId = new mongoose.Types.ObjectId(userId);
  const user = await this.findById(objectId).select(
    "friends friendRequestsSent friendRequestsReceived"
  );
  if (!user) return [];

  const excludeIds = [
    objectId,
    ...(user.friends || []),
    ...(user.friendRequestsSent || []),
    ...(user.friendRequestsReceived || []),
  ].map((id: mongoose.Types.ObjectId) =>
    id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
  );

  // aggregation: compute number of mutual friends and sort desc
  const pipeline = [
    {
      $match: {
        _id: { $nin: excludeIds },
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        mutualCount: {
          $size: {
            $setIntersection: ["$friends", user.friends || []],
          },
        },
      },
    },
    { $sort: { mutualCount: -1 } },
    { $limit: limit },
  ];

  return await this.aggregate(pipeline as any);
};

export default mongoose.model<IUser, IUserModel>("User", userSchema);
