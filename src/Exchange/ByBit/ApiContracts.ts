import { ApiContract } from "Model/Network";

export namespace ApiContracts {

    export type Symbol = 'BTCUSD' | 'ETHUSD' | 'XRPUSD' | 'EOSUSD';
    export type TimeInForce = "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill" | "PostOnly"
    export type PositionStatus = 'Normal' | 'Liq' | 'Adl'

    export interface Response<TResult> {
        ret_code: number,
        ret_msg: string,
        ext_code: string,
        result: TResult,
        time_now: string
    }

    export namespace Common {
        /**
         * Get bybit server time。
        
         * GET /v2/public/time
         * Testnet: https://api-testnet.bybit.com/v2/public/time
         * Mainnet: https://api.bybit.com/v2/public/time
         */
        export type ServerTime = ApiContract<{}, {}>
    }

    export namespace ActiveOrders {
        /**
         * Parameters of 'side', 'symbol', 'order_type', 'qty', 'price', 'time_in_force' are required for all active orders. Other parameters are optional unless specified.
         * Market price active order: A traditional market price order, will be filled at the best available price. 'price' and 'time_in_force' can set to be "" if and only if you are placing market price order.
         * Limit price active order: You can set an execution price for your order. Only when last traded price reaches the order price, the system will fill your order.
         * Take profit/Stop loss: You may only set a take-profit/stop-loss conditional order upon opening the position. Once you hold a position, the take profit and stop loss information u sent when placing an order will no longer be valid.
         * Order quantity: This parameter indicates the quantity of perpetual contracts you want to buy or sell, currently Bybit only support order quantity in an integer.
         * Order price: This parameter indicates the price of perpetual contracts you want to buy or sell, currently Bybit only support price increment of every 0.5.
         * Customize conditional order ID: You may customize order IDs for active orders. We will link it to the system order ID , and return the unique system order ID to you after the active order is created successfully. You may use this order ID to cancel your active order. The customized order ID is asked to be unique, with a maximum length of 36 characters.
         * Notes:
         * Each account can hold up to 200 active orders yet to be filled entirely simultaneously.
         * 'order_status' values explained:
         * 'Created' indicates the order has been accepted by the system but not yet entered into the orderbook
         * 'New' indicates the order has entered into the orderbook.
         *
         * POST /open-api/order/create
         * Testnet: https://api-testnet.bybit.com/open-api/order/create
         * Mainnet: https://api.bybit.com/open-api/order/create
         */
        export type PlaceActiveOrder = ApiContract<
            {
                side: string,                       // Side
                symbol: string,                     // Contract type.
                order_type: string,                 // Active order type
                qty: integer,                       // Order quantity.
                price: integer,                     // Order price.
                time_in_force: string,              // Time in force
                take_profit?: number,               // take profit price
                stop_loss?: number,                 // stop loss price
                reduce_only?: bool,                 // reduce only
                close_on_trigger?: bool,            // close on trigger
                order_link_id?: string              // Customized order ID, maximum length at 36 characters, and order ID under the same agency has to be unique.
            },
            {
                order_id: 'string',                 // Unique order ID
                user_id: 0,                         // User ID
                symbol: 'string',                   // Contract type
                side: 'string',                     // Side
                order_type: 'string',               // Order type
                price: 0,                           // Order price
                qty: 0,                             // Order quantity
                time_in_force: 'string',            // Time in force
                order_status: 'string',             // Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled
                last_exec_time: 0.000000,           // Last execution time
                last_exec_price: 0,                 // Last execution price
                leaves_qty: 0,                      // Remaining order quantity
                cum_exec_qty: 0,                    // Accumulated execution quantity
                cum_exec_value: 0,                  // Accumulated execution value
                cum_exec_fee: 0,                    // Accumulated execution fee
                reject_reason: 'string',            // Reason for rejection
                order_link_id: 'string',            // Agency customized order ID
                created_at: '2018-10-15T04:12:19.000Z',
                updated_at: '2018-10-15T04:12:19.000Z',
            }
        >

        /**
         * Get my active order list
         * 
         * GET /open-api/order/list
         * Testnet: https://api-testnet.bybit.com/open-api/order/list
         * Mainnet: https://api.bybit.com/open-api/order/list
         */
        export type GetActiveOrder = ApiContract<
            {
                order_id?: string,                  // Order ID
                order_link_id?: string,             // Customized order ID
                symbol?: string,                    // Contract type. Default BTCUSD
                order?: string,                     // Sort orders by creation date
                page?: integer,                     // Page. Default getting first page data
                limit?: integer,                    // Limit for data size per page, max size is 50. Default as showing 20 pieces of data per page
                order_status?: string               // Query your orders for all statuses if 'order_status' is empty. If you want to query orders with specific statuses , you can pass the order_status split by ','.
            },
            {
                data: [
                    {
                        order_id: 'string',                 // Unique order ID
                        user_id: 0,                         // User ID
                        symbol: 'string',                   // Contract type
                        side: 'string',                     // Side
                        order_type: 'string',               // Order type
                        price: 0,                           // Order price
                        qty: 0,                             // Order quantity
                        time_in_force: 'string',            // Time in force
                        order_status: 'string',             // Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled
                        last_exec_time: 0.000000,          // Last execution time
                        last_exec_price: 0,                 // Last execution price
                        leaves_qty: 0,                      // Remaining order quantity
                        cum_exec_qty: 0,                    // Accumulated execution quantity
                        cum_exec_value: 0,                  // Accumulated execution value
                        cum_exec_fee: 0,                    // Accumulated execution fee
                        reject_reason: 'string',            // Reason for rejection
                        order_link_id: 'string',            // Agency customized order ID
                        created_at: '2018-10-15T04:12:19.000Z',
                        updated_at: '2018-10-15T04:12:19.000Z',
                    }
                ],
                current_page: 1,
                total: 1
            }
        >

        /**
         * 'order_id' is required for cancelling active order. The unique 36 characters order ID was returned to you when the active order was created successfully. 'symbol' is recommend filled, Otherwise, there will be a small probability of failure.
         * You may cancel active order that are unfilled and partially filled. Fully filled order cannot be cancelled.
         * 
         * POST /open-api/order/cancel
         * Testnet https://api-testnet.bybit.com/open-api/order/cancel
         * Mainnet https://api.bybit.com/open-api/order/cancel
         */
        export type CancelActiveOrder = ApiContract<
            {
                order_id: string,                   // Your active order ID. The unique order ID returned to you when the corresponding active order was created
                symbol?: string                     // Contract type.
            },
            {
                order_id: 'string',                 // Unique order ID
                user_id: 0,                         // User ID
                symbol: 'string',                   // Contract type
                side: 'string',                     // Side
                order_type: 'string',               // Order type
                price: 0,                           // Order price
                qty: 0,                             // Order quantity
                time_in_force: 'string',            // Time in force
                order_status: 'string',             // Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled
                last_exec_time: 0.000000,           // Last execution time
                last_exec_price: 0,                 // Last execution price
                leaves_qty: 0,                      // Remaining order quantity
                cum_exec_qty: 0,                    // Accumulated execution quantity
                cum_exec_value: 0,                  // Accumulated execution value
                cum_exec_fee: 0,                    // Accumulated execution fee
                reject_reason: 'string',            // Reason for rejection
                order_link_id: 'string',            // Agency customized order ID
                created_at: '2018-10-15T04:12:19.000Z',
                updated_at: '2018-10-15T04:12:19.000Z',
            }
        >
    }

    export namespace ConditionalOrder {
        /**
         * Parameters of 'side', 'symbol', 'order_type', 'qty', 'price', 'base_price', 'stop_px', 'time_in_force' are required for all active orders. Other parameters are optional unless specified.
         * Market price conditional order: A traditional market price order, will be filled at the best available price. 'price' and 'time_in_force' can set to be "" if and only if you are placing market price order.
         * Limit price conditional order: You can set an execution price for your order. Only when last traded price reaches the order price, the system will fill your order.
         * Take profit/Stop loss: You may only set a take-profit/stop-loss conditional order upon opening the position. Once you hold a position, the take profit and stop loss information u sent when placing an order will no longer be valid.
         * Order quantity: This parameter indicates the quantity of perpetual contracts you want to buy or sell, currently Bybit only support order quantity in an integer.
         * Order price: This parameter indicates the price of perpetual contracts you want to buy or sell, currently Bybit only support price increment of every 0.5.
         * Conditional order trigger price: You may set a trigger price for your conditional order. conditional order will not enter the order book until the last price hits the trigger price. When last price hits trigger price: 1) your limit conditional order will enter order book, and wait to be executed; 2) your market conditional order will be executed immediately at the best available market price.
         * Customize conditional order ID: You may customize order IDs for active orders. We will link it to the system order ID , and return the unique system order ID to you after the active order is created successfully. You may use this order ID to cancel your active order. The customized order ID is asked to be unique, with a maximum length of 36 characters.
         * Note: Take profit/Stop loss is not supported in placing conditional orders. One can only use these 2 functions when placing active orders. Moreover, each account can hold up to 10 conditional orders yet to be filled entirely simultaneously.
         * 
         * POST /open-api/stop-order/create
         * Testnet https://api-testnet.bybit.com/open-api/stop-order/create
         * Mainnet https://api.bybit.com/open-api/stop-order/create
         */
        export type PlaceConditionalOrder = ApiContract<
            {
                side: string,                       // Side.
                symbol: string,                     // Contract type.
                order_type: string,                 // Conditional order type.
                qty: integer,                       // Order quantity.
                price: integer,                     // Execution price for conditional order
                base_price: integer,                // Send current market price. It will be used to compare with the value of 'stop_px', to decide whether your conditional order will be triggered by crossing trigger price from upper side or lower side. Mainly used to identify the expected direction of the current conditional order.
                stop_px: integer,                   // Trigger price
                time_in_force: string,              // Time in force
                close_on_trigger?: bool,            // close on trigger
                order_link_id?: string              // Customized order ID, maximum length at 36 characters, and order ID under the same agency has to be unique.
            },
            {
                stop_order_id: 'string',            // Unique order ID
                user_id: 0,                         // User ID
                stop_order_status: 'string',        // Order status: Untriggered: order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed
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
        >

        /**
         * Get my conditional order list。
         * 
         * GET /open-api/stop-order/list
         * Testnet https://api-testnet.bybit.com/open-api/stop-order/list
         * Mainnet https://api.bybit.com/open-api/stop-order/list
         */
        export type GetConditionalOrder = ApiContract<
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

        /**
         * 'stop_order_id' is required for cancelling conditional order. The unique 36 characters order ID was returned to you when the condional order was created successfully.
         * You may cancel all untriggered conditional orders. Essentially, after a conditional order is triggered, it will become an active order. So, when a conditional order is triggered, cancellation has to be done through the active order port for all unfilled or partial filled active order. Similarly, order that has been fully filled cannot be cancelled.
         * 
         * POST /open-api/stop-order/cancel
         * Testnet https://api-testnet.bybit.com/open-api/stop-order/cancel
         * Mainnet https://api.bybit.com/open-api/stop-order/cancel
         */
        export type CancelConditionalOrder = ApiContract<
            {
                stop_order_id: string               // Order ID. The unique order ID returned to you when the corresponding order was created.
            },
            {
                stop_order_id: 'string',            // Unique order ID
                user_id: 0,                         // User ID
                stop_order_status: 'string',        // Order status: Untriggered: order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed
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
        >
    }

    export namespace Positions {
        /**
         * Get user leverage
         * 
         * GET /user/leverage
         * Testnet https://api-testnet.bybit.com/user/leverage
         * Mainnet https://api.bybit.com/user/leverage
         */
        export type UserLeverage = ApiContract<{}, null>

        /**
         * Change user leverage
         * 
         * POST /user/leverage/save
         * Testnet https://api-testnet.bybit.com/user/leverage/save
         * Mainnet https://api.bybit.com/user/leverage/save
         */
        export type ChangeUserLeverage = ApiContract<
            {
                symbol: string,                     // Contract type
                leverage: string                    // leverage
            },
            null
        >
    }
}