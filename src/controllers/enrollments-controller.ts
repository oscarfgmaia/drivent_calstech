import { AuthenticatedRequest } from '@/middlewares';
import enrollmentsService from '@/services/enrollments-service';
import axios from 'axios';
import { Response, Request } from 'express';
import httpStatus from 'http-status';
import { ViaCEPAddress, ViaCEPAddressResponse } from '@/protocols';
export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: Request, res: Response) {
  const { cep } = req.query as Record<string, string>;
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    const responseObj = response.data as ViaCEPAddress;
    const newViaCep = {
      bairro: responseObj.bairro,
      cidade: responseObj.localidade,
      uf: responseObj.uf,
      complemento: responseObj.complemento,
      logradouro: responseObj.logradouro,
    } as ViaCEPAddressResponse;
    res.send(newViaCep);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
