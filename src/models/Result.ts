import mongoose, { Document, Schema } from 'mongoose';

interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedAnswer: string;
  isCorrect: boolean;
  points: number;
}

interface IResult extends Document {
  user: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  answers: IAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

const resultSchema = new Schema<IResult>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
    points: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IResult>('Result', resultSchema);
