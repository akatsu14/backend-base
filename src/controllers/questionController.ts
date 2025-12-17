import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Question from '../models/Question';

export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.query;
    const filter: any = {};

    if (examId) {
      filter.exam = examId;
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { question, type, options, correctAnswer, points, explanation, exam } = req.body;

    const newQuestion = await Question.create({
      question,
      type,
      options,
      correctAnswer,
      points,
      explanation,
      exam,
      createdBy: req.userId
    });

    res.status(201).json({
      success: true,
      data: newQuestion
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
