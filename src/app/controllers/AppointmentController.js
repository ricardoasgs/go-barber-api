import * as Yup from 'yup';
import {
  parseISO,
  startOfHour,
  isBefore,
  startOfDay,
  endOfDay,
  endOfHour,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { date, provider_id } = req.body;

    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'you can only create appointments with providers' });
    }

    const hourStart = startOfHour(parseISO(date));

    const hourEnd = endOfHour(parseISO(date));

    /*
    Check for Past Dates
    */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'past dates are not permitted' });
    }

    /*
    Check for date availability
    */
    const checkAvalilability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: {
          [Op.between]: [hourStart, hourEnd],
        },
      },
    });

    if (checkAvalilability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not availabe' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();