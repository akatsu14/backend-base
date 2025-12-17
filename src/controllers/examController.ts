import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Exam from '../models/Exam';

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .populate('questions')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getExam = async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'questions',
        select: 'question type options points explanation'
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, subject, duration, totalQuestions, totalPoints, passingScore } = req.body;

    const exam = await Exam.create({
      title,
      description,
      subject,
      duration,
      totalQuestions,
      totalPoints,
      passingScore,
      createdBy: req.userId
    });

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateExam = async (req: AuthRequest, res: Response) => {
  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
