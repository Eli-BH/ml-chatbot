import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PipedriveService {
  private readonly pipedriveKey;

  constructor(
    private readonly httpService: HttpService,
    private readonly ConfigService: ConfigService,
  ) {
    this.pipedriveKey = this.ConfigService.get('PIPEDRIVE_API_KEY');
  }

  async getPipedriveData(endpoint: string): Promise<any> {
    try {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.pipedrive.com/v1/${endpoint}`,
        headers: {
          Accept: 'application/json',
          'x-api-token': this.pipedriveKey,
          Cookie:
            '__cf_bm=Z9bgBq1Z1KXV3l_KEyofPTzejN_V4triJdnLWGucj4A-1730435081-1.0.1.1-srb_LRHgTTUt8bdvlLy6c_YTC5TeT5W4upM1ppWnsHeNAutmvm_JtL860GHI9h4zVpZRlXDpB5pGyb1zZrTckg',
        },
      };

      const { data } = await this.httpService.axiosRef.request(config);

      return data;
    } catch (error) {
      console.log({ error });
      return 'Sorry, I am unable to process your request at the moment.';
    }
  }
}
