import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { config } from '../../../config/app.config';
import { GenerateQRDto } from '../dto/viet-qr.dto';
import { BankService } from '../bank/bank.service';
const { clientId, apiKey, baseUrl } = config.vietQR;

@Injectable()
export class VietQRService {
  constructor(
    private httpService: HttpService,
    private readonly bankService: BankService,
  ) {}

  async generateQR(payload: GenerateQRDto) {
    const { accountNo, accountName, acqId, amount, addInfo } = payload;
    const response = await firstValueFrom(
      this.httpService.post(
        baseUrl,
        {
          acqId: Number(acqId),
          accountNo: accountNo,
          accountName,
          amount: Number(amount),
          addInfo,
          format: 'text',
          template: 'compact2',
        },
        {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }

  async generateQRByBankId(bankId: string) {
    const bankAccount = await this.bankService.findOne(bankId);

    const payload: GenerateQRDto = {
      accountName: bankAccount.accountName,
      accountNo: bankAccount.accountNo,
      acqId: bankAccount.acqId,
      amount: 10000,
      addInfo: 'Admin Checking STK',
    };

    return await this.generateQR(payload);
  }
}
