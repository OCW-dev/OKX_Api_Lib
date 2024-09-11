import CryptoJS from 'crypto-js';

import * as dotenv from 'dotenv';
dotenv.config();



export class OKX_API {
    constructor() {
        this.headers = {
            'OK-ACCESS-PROJECT': process.env.PROJECT_ID,
            'OK-ACCESS-KEY': process.env.API,
            'OK-ACCESS-PASSPHRASE': process.env.PASSPHRASE
        };

        this.api_secret = process.env.SECRET_API;
    }


    configure_headers(url, method, body=false, application=false)
    {
        let headers_ = this.headers

        let timestamp = new Date().toISOString();

        let sign = timestamp + method + url;
        if (body != false)
        {
            sign += body;
        }

        headers_["OK-ACCESS-SIGN"] = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(sign, this.api_secret));
        headers_["OK-ACCESS-TIMESTAMP"] = timestamp;

        if (application != false)
        {
            headers_["Content-Type"] = "application/json";
        }

        return headers_;
    }

    getChainId(chainName, chainsData)
    {
        return chainsData[chainName].id
    }

    async get_all_token_addresses(chainId)
    {
        let required_url = `/api/v5/dex/aggregator/all-tokens?chainId=${chainId}`;

        let headers = this.configure_headers(required_url, "GET");

        let api_params = {method: 'GET',
                headers: headers,
        }

        let req = new Request("https://www.okx.com" + required_url, api_params);

        const all_token_addresses = await this.sendFetch(req);

        let returnData = {};
        for (const [key, value] of Object.entries(all_token_addresses)) {
            returnData[value.tokenSymbol] = {"address": value.tokenContractAddress, "name": value.tokenName, "logo": value.tokenLogoUrl};
          }

        return returnData;
    }

    async get_token_prices(chainId, addresses) {
        let required_url = `/api/v5/wallet/token/current-price`;

        let body = JSON.stringify([
            {
                "chainIndex": "1",
                "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
            }    
        ]);

        let headers = this.configure_headers(required_url, "POST", body, true);

        let api_params = {method: 'POST',
                headers: headers,
                body: body
            };

        console.log(api_params);
        let req = new Request("https://www.okx.com" + required_url, api_params);

        const all_token_addresses = await this.sendFetch(req);
        console.log(all_token_addresses);
    }

    async get_all_chain_addresses()
    {
        let required_url = `/api/v5/dex/aggregator/supported/chain`;

        let api_params = {method: 'GET',
                headers: this.configure_headers(required_url, "GET")
            };

        let req = new Request("https://www.okx.com" + required_url, api_params);

        const all_chain_addresses = await this.sendFetch(req);

        let returnData = {};
        for (const [key, value] of Object.entries(all_chain_addresses)) {
            returnData[value.chainName] = {"id": value.chainId, "address": value.dexTokenApproveAddress};
          }

        return returnData;
    }

    async sendFetch(req)
    {
        const response = await fetch(req);
        const data = await response.json();
        console.log(data);

        return data.data;
    }
}