import mongoose, { Document, Schema } from 'mongoose';

interface IExam extends Document {
  title: string;
  description?: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  questions: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 100
  },
  passingScore: {
    type: Number,
    required: true,
    default: 60
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IExam>('Exam', examSchema);
