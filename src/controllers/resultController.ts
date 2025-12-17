import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Exam from '../models/Exam';
import Result from '../models/Result';

export const submitResult = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, answers, timeSpent, startedAt } = req.body;

    const exam = await Exam.findById(examId).populate('questions');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    let totalScore = 0;
    const processedAnswers: any[] = [];

    for (const answer of answers) {
      const question = (exam.questions as any[]).find(q => q._id.toString() === answer.questionId);

      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      const points = isCorrect ? question.points : 0;

      totalScore += points;

      processedAnswers.push({
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        points
      });
    }

    const percentage = (totalScore / exam.totalPoints) * 100;
    const isPassed = percentage >= exam.passingScore;

    const result = await Result.create({
      user: req.userId,
      exam: examId,
      answers: processedAnswers,
      totalScore,
      maxScore: exam.totalPoints,
      percentage: Math.round(percentage),
      isPassed,
      timeSpent,
      startedAt,
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserResults = async (req: AuthRequest, res: Response) => {
  try {
    const results = await Result.find({ user: req.userId })
      .populate('exam', 'title subject')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getResult = async (req: AuthRequest, res: Response) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('user', 'name email')
      .populate('exam', 'title subject totalPoints passingScore');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getExamResults = async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ exam: examId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
