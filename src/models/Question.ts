import mongoose, { Document, Schema } from 'mongoose';

interface IOption {
  text: string;
  isCorrect: boolean;
}

interface IQuestion extends Document {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: IOption[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  exam: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    _id: false,
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String
  },
  points: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

export default mongoose.model<IQuestion>('Question', questionSchema);
