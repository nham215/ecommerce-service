import { Injectable } from '@nestjs/common';
import { OrderRoyalMail } from '../model/RoyalMail';
import axios from 'axios';

@Injectable()
export class RoyalMailService {
  async getOrder(props: {}) {
    const listOrder = axios.post(
      'https://apibusiness.parcel.royalmail.com/api/orders/v2',
      {
        filter: [
          {
            compareFunction: 'is',
            field: 'status',
            showOnlyEmptyStrings: false,
            useNegation: false,
            value: '1',
          },
        ],
        paging: {
          pageIndex: 0,
          pageSize: 500,
        },
        sort: {
          direction: 'descending',
          field: 'accountOrderNumber',
        },
      },
      {
        headers: {
          'x-xsrf-token':
            'adzSXCyBzZZvmoDZLCVbnBfX_fpKpDYxgcFlMe8AxF0hNMwNj0yVcdOGjUvCi3sP6ATMgk-ES2R8C7x4I0g5C_JVpahADf3y0laIABNxKbUC8lQqTuHAFYpthG1AtZlzLi1Gyg2',
          Cookie: `CONSENTMGR=c1:0%7Cc2:0%7Cc3:0%7Cc4:0%7Cc5:0%7Cc6:0%7Cc7:0%7Cc8:0%7Cc9:0%7Cc10:0%7Cc11:0%7Cc12:0%7Cc13:0%7Cc14:0%7Cc15:1%7Cts:1717579865114%7Cconsent:true; OPT_IN_CONSENT=OPT-IN-CC; OPT_IN_TEMP=OPT-IN-TEMP-Cookie; RT="z=1&dm=royalmail.com&si=f1pckx19jus&ss=lxl9bwic&sl=0&tt=0"; RoyalMail.Authentication.V2=JxUjazYvLJnUfdjvnRXBigIkPYVPa8oZuPXO8GeccNBTlgqCjAU8E85g2Tk70eoA-NxIa-DW80ECOLroycf_aluvkLlePUxHNLG_AXHnJXAvintXLrXQojVfNgkbgZ_OxA5gWhXIvt0hEukrifUtbCkkmlVjzJUGnIRdqFFrI49wOz_3ip1qmGmpCaOAItmbvpIthlykNWl_rC0wsx5AURG2HmDVaAoTa3nqoKFd7cE_bT1wIMcn5dxXfahlboxHyJ3p8fwiMIn7ERz5O6lw_aADgsoQvaAZ_cltnIuC_OQQhinzladHBX9Bn5QZ3dS-Gr88cTO6Y0YlmCoCtrzEekw0WTja0PWrFmrPuojco8zt-32dLAqiFwsjcjJFq8DFM5EazWs6ctjDVE5GZ9kJEerN8vqdFutqNt5J8qABvra-cS-H7HvRNtuyR25Ef--Zzqm9AYj9BkeA9MGqgdWPqP2Bki6_9GQhagpvE1iHta7rc6IwVW8Aryeka9yv-09Jq2ViH8wBC7xAQEj3SzVy7UOVTYzbqC4cEodvi4hTi9w0d4ldqshMfS0HrjHsHrL1RPnGz-MHznCVYIxLGsUzsYWqWpRciLmNHJJwUF5AXFmAf0eRhPwEe-VoFOUKF53z5hgnbsR9AywBkBSRV5fiOWpVVTF-Hdb3g5o7u9zW0FCuQDQpyrI83QXLjxJ3OcQIFu4Aoyry6vz6HE2-cBE8FjBeoHzqDZ9mMou76Sp4wL8FFsdp08Yb2jMMAhhljxNPoRREO1NJurKgyAQrCEQZ31TMFfyRy613NsSfZieoToNY4ym9G06toIqSJ_jS9mniQI2Jocvwyrt4HI1was3yGwWtzzsmiirWqWNuOOET67gMZAB-a7u-U4f7HsPt8e2pPQPORM1j5Bciwp-i_pn9DyDSXKzDWpsqN_aIK15b2Rxs9NCxYyVAaFBJa0tqeb_sCjo2waFPNsj-6elffu0Knc4hVQ8V-Rg5DK6hpWZKm2RscwdE6QrH29xXDWALB4WXwwZKKnfiqK-Ct9M1GeqVUMKOENHpCN9p3IxDPaJ8xXS31CKxxyNwy_S7nVJS_nrYYkBYOGTBrxkyAkypMJX7WgwQabgsJc3iuXITje6UaxPxL4E5BCJyn-tdy7ZU_Y4X7v87rMBBX4eGQjKEGN5UgMUCq-XP87WigCPl4Fko4nXQr0qdjTgDvQeCz5lKK64-akkQkiQhHkGODO2uTqIGdiK_MVvRRBHpH5L46PyeoxcCKpk-lAzuHlqJuagojIQc3V7aEKT8LwdfQwIuxaT0sw5o5bkVWdJsPNGht_SwXoTfxBdeCOamd6OlC02NVX2rUOteiXtYVV4o0fOZ8UqkKWr5TVcw_JFgaRUnJYxxoyaKntzrjxeDy6QFTF-neDMap4KAOJSO7iWcW-H7pLQaIDElc0wZQiCn9oXRnsBlTZCa1he7iNTUvjJ6fvBK0UptIjm_Y-K8bRksUNXbxwlmiA_tm5BXKEoG0dAIwzrk73T_vAzHHQSOmL3RnZFVNL4LWUhLjZYIFQJSMsekEPXSUPg_5FuRS0TkcvUWeWaTroW3oySFuQBQRsroWH2ee6_rVrzMrTAcAgd-kX0bTY7T1Mp9NkfxqqVyi-P9SA46j3Rsx280pBHc8KTU2KoGyyoOs-PMG0sKHaB09BeH2LrW7Q8ldMGUUrUPHPbcvzJiWJcdG-gZ9jKy53kjZ8JJtL7l1OvjciSyAHOy5bVe47of7bf-dKM9J89TMUXYLLr3qDYz6OUfRsoCkYZtIqE2vCQqiz7w2O6w_EPYRv0LeYZKkFPgbmcFiNjKmcuMKs8JRfPoPPricQvronQ9OogHi9W7LwI7E-YRXXN-Otnki4ET_mMrTV6nObj4uv6g7Fi6IfGXytUTOA-CQbl6YBsYv85icY4dTRY-0nIT2j5tECMli--h07WJyl8MaOd9YlTDJid8joR3dXH1x5BBXwXURYCu8tBIDIxGtiGr3eyH82SQgBtvshVCFF-uyHX0QPkKNamdQg_UqX1XOFR5Tf_pwJ9qdRDVQzQRgtfFL_Fww5ZB7h6pLa6vUfi6g0xhgdIQ0FYSswLhq6Uc3hBY1aAJ69iFI_ju9zGz3897ZBRqwzEW0ACwXhlVZIsGC2Z-YulbYWDa60vah35mxWMdxQZmk3oEw3pDE6a53Y-29b-LvoiZS-RT-XdoWv9_0D-mXLgefZZ7Z_8VvXkUsRfZ5kc0sRdBNR580HkVaIu0kHclOOq4Ez4aqUKece9VnvPjGOd3eobe_MzspWR1qZsVZMhWZLZwAqbUMmcJ4WRrRPOP8G4z9fkrdC5sGD-RpRWBatwIvLcR_HNCF9VShS7defRtQy7Z0EkswdwB543dgXxTu1rmahqOFEbJSSvX9iOXrHdeC8-x2APbbpnaVt3Q3Izac9_nuNU1yue_mnzWSN-BBznPYzpRUixj1ZI-YDo4y7xDtABZFWst; utag_main=v_id:018fe7bcc706005e04c2f166c5b40506501ac05d00bd0$_sn:11$_se:3$_ss:0$_st:1719023890196$ses_id:1719022032391%3Bexp-session$_pn:3%3Bexp-session; __AFVTokenAPI=xnzjTTfveLQUy966_sIB0Nr68yZy5ilqNRFFNxiTd3P8UhqHu_d8AMtESf4KhlT0gx6rwYjyceLG8RZZGnW23q4OrPQ1`,
        },
      },
    );
    console.log((await listOrder).data.data);
    return [{}] as OrderRoyalMail[];
  }
}
