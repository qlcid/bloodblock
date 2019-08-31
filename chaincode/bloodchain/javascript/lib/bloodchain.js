/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class BloodChain extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        // 초기화 데이터 넣어놓은 거~
        const bloodCards = [
            {
                owner: 'wocjf8888',
                is_donated: false,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
            },
            {
                owner: 'jaecheol1234',
                is_donated: false,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
            },
        ];

        for (let i = 0; i < bloodCards.length; i++) {
            bloodCards[i].docType = 'bloodCard';
            await ctx.stub.putState('BLOODCARD' + i, Buffer.from(JSON.stringify(bloodCards[i])));
            console.info('Added <--> ', bloodCards[i]);
        }


        console.info('============= END : Initialize Ledger ===========');
    }

    async queryBloodCard(ctx, serialNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }
    async queryAllBloodCards(ctx) {
        const iterator = await ctx.stub.getQueryResult("{\"fields\": [\"owner\"], \"selector\": {\"docType\": \"bloodCard\"}}");
        console.log(iterator)
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            console.log(res);
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
    async register(ctx, serialNumber, owner) {
        console.info('============= START : Create bloodCard ===========');

        const bloodCard = {
            owner,
            is_donated: false,
            donater: null,
            dona_date: null,
            is_used: false,
            used_place: null,
            docType: 'bloodCard',
        };

        await ctx.stub.putState(serialNumber, Buffer.from(JSON.stringify(bloodCard)));
        console.info('============= END : Create bloodCard ===========');
    }



    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

}

module.exports = BloodChain;
