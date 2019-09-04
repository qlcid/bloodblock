/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class BloodChain extends Contract {

    // 구현 완료
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        // 초기화 데이터 넣어놓은 거~ z
        const bloodCards = [
            {
                owner: 'wocjf8888',
                reg_date: new Date().toLocaleDateString(),
                is_donated: false,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
                used_date: null
            },
            {
                owner: 'jaecheol1234',
                reg_date: new Date().toLocaleDateString(),
                is_donated: false,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
                used_date: null
            },
            {
                owner: 'ys97',
                reg_date: new Date().toLocaleDateString(),
                is_donated: true,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
                used_date: null
            },
        ];

        for (let i = 0; i < bloodCards.length; i++) {
            bloodCards[i].docType = 'bloodCard';
            await ctx.stub.putState('BLOODCARD' + i, Buffer.from(JSON.stringify(bloodCards[i])));
            console.info('Added <--> ', bloodCards[i]);
        }


        console.info('============= END : Initialize Ledger ===========');
    }

 

    // 모든 헌혈증의 모든 value 검색(확인용, 구현 완료) return : 헌혈증 key, value(record) 문자열화 한 배열
    async queryAllBloodCards(ctx) {
        // var query = {
        //     "selector": {
        //         "docType": "bloodCard"
        //     }
        // }
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard"
            }
        }`);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // 등록 o 기부 x    return : 여러개 나올 수 있으므로 queryAllBloodCards와 비슷하게 해야함 reg_date
    async queryBloodCardsOnlyReg(ctx, owner) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard"
            }
        }`);
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }

            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // 기부 o 사용 o | x  return : 여러개 나올 수 있으므로 queryAllBloodCards와 비슷하게 해야함
    async queryBloodCardsDona(ctx, donater) {
       
    }

    // 기부받은 헌혈증 확인 
    async queryBloodCardsDonated(ctx, owner) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard",
                "is_donated": true,
                "owner": "${owner}"
            }
        }`);
        const allResults = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }

            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // 헌혈증 등록(구현 완료) return : x
    async register(ctx, serialNumber, owner) {
        console.info('============= START : Create bloodCard ===========');
        const bloodCard = {
            owner,
            reg_date: new Date().toLocaleDateString(),
            is_donated: false,
            donater: null,
            dona_date: null,
            is_used: false,
            used_place: null,
            used_date: null,
            docType: 'bloodCard',
        };

        await ctx.stub.putState(serialNumber, Buffer.from(JSON.stringify(bloodCard)));
        console.info('============= END : Create bloodCard ===========');
    }

    // 헌혈증 기부(구현 완료) return : x
    async donate(ctx, donate_count, donater, newOwner, used_place) {
        console.info('============= START : donate ===========');
 
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "reg_date": {"$ne": null},
                "docType": "bloodCard", 
                "owner": "${donater}", 
                "is_donated": false
            },
            "sort": [
                {"reg_date": "asc"}
            ],
            "limit": ${donate_count}
        }`);
        while (true) {
            const res = await iterator.next();

            var bloodCard = JSON.parse(res.value.value.toString('utf8'));
            bloodCard.is_used = true;
            bloodCard.owner = newOwner;
            bloodCard.is_donated = true;
            bloodCard.donater = donater;
            bloodCard.dona_date = new Date().toLocaleDateString();
            bloodCard.used_place = used_place;

            await ctx.stub.putState(res.value.key, Buffer.from(JSON.stringify(bloodCard)));

            if (res.done) {
                console.info('============= END : donate ===========');
                return;
            }
        }
    }

    // 헌혈증 사용(구현 완료) return : x
    async useCard(ctx, donateRequester){
        console.log(donateRequester);
        const iterator = await ctx.stub.getQueryResult(`{ \"selector\": {\"docType\": \"bloodCard\", \"owner\": \"${donateRequester}\"} }`);
            while (true) {
                const res = await iterator.next();

                var bloodCard = JSON.parse(res.value.value.toString('utf8'));
                bloodCard.is_used = true;
                bloodCard.used_date = new Date().toLocaleDateString();
                await ctx.stub.putState(res.value.key, Buffer.from(JSON.stringify(bloodCard)));
                if(res.done)
                    return;
            }
    }

}

module.exports = BloodChain;
