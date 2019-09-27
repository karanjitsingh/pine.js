import { ApiContract, INetwork } from "Model/Network";

export interface Response<TResult> {
    ret_code: number,
    ret_msg: string,
    ext_code: string,
    result: TResult,
    time_now: string
}

interface IByBitApis {
    ActiveOrders: {
        /**
         * GET /open-api/stop-order/list
         * Testnet https://api-testnet.bybit.com/open-api/stop-order/list
         * Mainnet https://api.bybit.com/open-api/stop-order/list
         */
        x: ApiContract<
            {
                stop_order_id?: string,             // Order ID of conditional order
                order_link_id?: string,             // Agency customized order ID
                symbol?: string,                    // Contract type. Default BTCUSD
                order?: string,                     // Sort orders by creation date
                page?: integer,                     // Page. Default getting first page data
                limit?: integer                     // Limit for data size per page, max size is 50. Default as showing 20 pieces of data per page
            },
            {
                data: [
                {
                stop_order_id: 'string',            // Unique order ID
                user_id: 0,                         // User ID
                stop_order_status: 'string',        // Order status: Untriggered: Pending order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed
                symbol: 'string',                   // Contract type
                side: 'string',                     // Side
                order_type: 'string',               // Price type
                price: 0,                           // Order price
                qty: 0,                             // Order quantity
                time_in_force: 'string',            // Time in force
                stop_order_type: 'string',          // Order type
                base_price: 0,                      // 
                stop_px: 0,                         // trigger price
                order_link_id: 'string',            // Agency customized order ID
                created_at: '2018-10-15T04:12:19.000Z',
                updated_at: '2018-10-15T04:12:19.000Z',
                }
                ],
                current_page: 1,
                total: 1
            }
        >
    }
}

const x: IByBitApis;

x.ActiveOrders

export class ByBitApi {
    constructor(private network: INetwork) {

    }

    public ActiveOrders = {


        placeActiveOrder: () => {

        },


    }
}