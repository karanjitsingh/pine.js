import { ApiContract } from "Model/Network";
import { Side, OrderType, Timestamp, StringWrapped, UtcTimeStamp, OrderStatus, Int } from "Model/Contracts";

export type Symbol = "BTCUSD" | "ETHUSD" | "XRPUSD" | "EOSUSD";
export type Currency = "BTC" | "ETH" | "EOS" | "XRP";
export type WalletFundType = "Deposit" | "Withdraw" | "RealisedPNL" | "Commission" | "Refund" | "Prize" | "ExchangeOrderWithdraw" | "ExchangeOrderDeposit";

// TimeInForce = "" If and only if the user is placing a market order
export type TimeInForce = "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill" | "PostOnly" | "";

export type PositionStatus = "Normal" | "Liq" | "Adl";

export type SortOrder = "desc" /* default */ | "asc";

export type LastTickDirection = "PlusTick" | "ZeroPlusTick" | "MinusTick" | "ZeroMinusTick";

export type StopOrderStatus = "Untriggered" | "Triggered" | "Cancelled" | "Active" | "Rejected";

export interface ByBitApiResponse<TResult> {
    ret_code: number;
    ret_msg: string;
    ext_code: string;
    result: TResult;
    time_now: string;
}

export type ByBitApiContract<TParams, TResult> = ApiContract<TParams, ByBitApiResponse<TResult>>;

export type IntBoolean = 0 | 1;

export interface ByBitWebsocketContracts {

    /**
     * Websocket topic: execution
     */
    Execution: {
        exec_fee: StringWrapped<number>			        // "0.00009465"
        exec_id: string                                 // "c83a9fe7-7307-595b-b2c7-16375915a884"
        exec_qty: number                                // 1000
        exec_type: string                               // "Trade"
        is_maker: boolean                               // false
        leaves_qty: number                              // 0
        order_id: string                                // "b6ad8f2d-10e8-4bd0-a803-ec9b874a34fc"
        order_link_id: string                           // ""
        order_qty: number                               // 1000
        price: StringWrapped<number>			        // "7924"
        side: Side			                            // "Sell"
        symbol:	Symbol		                            // "BTCUSD"
        trade_time:	string		                        // "2019-10-23T03:34:57.901Z"
    }[];

    /**
     * Websocket topic: order
     */
    Order: {
        cum_exec_fee: StringWrapped<number>			    // "0.00009465"
        cum_exec_qty: number			                // 1000
        cum_exec_value: StringWrapped<number>		    // "0.12619888"
        last_exec_price: StringWrapped<number>		    // "7924"
        leaves_qty: number			                    // 0
        order_id: string			                    // "b6ad8f2d-10e8-4bd0-a803-ec9b874a34fc"
        order_link_id: string			                // ""
        order_status: OrderStatus			            // "Filled"
        order_type: OrderType			                // "Market"
        price: StringWrapped<number>	                // "7951"
        qty: number			                            // 1000
        side: Side			                            // "Sell"
        stop_loss: StringWrapped<number>			    // "0"
        symbol: Symbol			                        // "BTCUSD"
        take_profit: StringWrapped<number>			    // "0"
        time_in_force: TimeInForce			            // "ImmediateOrCancel"
        trailing_stop: StringWrapped<number>		    // "0"
        timestamp: string			                    // "2019-10-23T03:34:57.901Z"
    }[];

    /**
     * Websocket topic: position
     */
    Position: {
        auto_add_margin: IntBoolean			            // 0
        available_balance: StringWrapped<number>	    // "0.24384864"
        bust_price: StringWrapped<number>			    // "0"
        cum_realised_pnl: StringWrapped<number>		    // "0.01291595"
        entry_price: StringWrapped<number>			    // "0"
        leverage: StringWrapped<number>			        // "10"
        liq_price: StringWrapped<number>			    // "0"
        occ_closing_fee: StringWrapped<number>		    // "0"
        occ_funding_fee: StringWrapped<number>		    // "0"
        order_margin: StringWrapped<number>			    // "0.03906731"
        position_margin: StringWrapped<number>		    // "0"
        position_seq: number			                // 120844840
        position_status: PositionStatus			        // "Normal"
        position_value: StringWrapped<number>		    // "0"
        realised_pnl: StringWrapped<number>			    // "-0.00434982"
        risk_id: number			                        // 1
        side: Side | "None"			                    // "None"
        size: Int			                        // 0
        stop_loss: StringWrapped<number>			    // "0"
        symbol: Symbol			                        // "BTCUSD"
        take_profit: StringWrapped<number>			    // "0"
        trailing_stop: StringWrapped<number>		    // "0"
        user_id: number			                        // 105455
        wallet_balance:	StringWrapped<number>		    // "0.28291595"
    }[];

    /**
     * Websocket topic: private.wallet
     */
    Wallet: {
        available_balance: number			            // 0.23240129999999998
        cross_seq: number			                    // 278814121
        cum_realised_pnl: number			            // 0.01408436
        occ_closing_fee: number			                // 0.00010323
        occ_funding_fee: number			                // 0
        order_margin: number			                // 0.03906731
        position_margin: number			                // 0.01251252
        position_seq: number			                // 120836757
        realised_pnl: number			                // -0.00318141
        risk_id: number			                        // 1
        risk_section: Array<StringWrapped<number>>	    // ["1", "2", "3" ...]
        symbol: Symbol			                        // "BTCUSD"
        used_margin: number			                    // 0.05168306
        wallet_balance: number			                // 0.28408436
    }[];
}

export interface ByBitContracts {

    /**
     * Get bybit server time。

     * GET /v2/public/time
     * Testnet: https://api-testnet.bybit.com/v2/public/time
     * Mainnet: https://api.bybit.com/v2/public/time
     */
    ServerTime: ByBitApiContract<{}, {}>;

    /**
     * Parameters of 'side', 'symbol', 'order_type', 'qty', 'price', 'time_in_force' are required for all active orders. Other parameters are optional unless specified.
     *
     * Market price active order: A traditional market price order, will be filled at the best available price. 'price' and 'time_in_force' can set to be "" if and only if you are placing market price order.
     *
     * Limit price active order: You can set an execution price for your order. Only when last traded price reaches the order price, the system will fill your order.
     *
     * Take profit/Stop loss: You may only set a take-profit/stop-loss conditional order upon opening the position. Once you hold a position, the take profit and stop loss information u sent when placing an order will no longer be valid.
     *
     * Order quantity: This parameter indicates the quantity of perpetual contracts you want to buy or sell, currently Bybit only support order quantity in an integer.
     *
     * Order price: This parameter indicates the price of perpetual contracts you want to buy or sell, currently Bybit only support price increment of every 0.5.
     *
     * Customize conditional order ID: You may customize order IDs for active orders. We will link it to the system order ID , and return the unique system order ID to you after the active order is created successfully. You may use this order ID to cancel your active order. The customized order ID is asked to be unique, with a maximum length of 36 characters.
     *
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
    PlaceActiveOrder: ByBitApiContract<
        {
            /** Side */
            side: Side,
            /** Contract type. */
            symbol: Symbol,
            /** Active order type */
            order_type: OrderType,
            /** Order quantity. */
            qty: Int,
            /** Order price. */
            price: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** take profit price */
            take_profit?: number,
            /** stop loss price */
            stop_loss?: number,
            /** reduce only */
            reduce_only?: boolean,
            /** close on trigger */
            close_on_trigger?: boolean,
            /** Customized order ID, maximum length at 36 characters, and order ID under the same agency has to be unique. */
            order_link_id?: string
        },
        {
            /** Unique order ID */
            order_id: string,
            /** User ID */
            user_id: number,
            /** Contract type */
            symbol: Symbol,
            /** Side */
            side: Side,
            /** Order type */
            order_type: OrderType,
            /** Order price */
            price: number,
            /** Order quantity */
            qty: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled */
            order_status: OrderStatus,
            /** Last execution time */
            last_exec_time: number,
            /** Last execution price */
            last_exec_price: number,
            /** Remaining order quantity */
            leaves_qty: number,
            /** Accumulated execution quantity */
            cum_exec_qty: number,
            /** Accumulated execution value */
            cum_exec_value: number,
            /** Accumulated execution fee */
            cum_exec_fee: number,
            /** Reason for rejection */
            reject_reason: string,
            /** Agency customized order ID */
            order_link_id: string,
            created_at: Timestamp,
            updated_at: Timestamp
        }
    >;

    /**
     * Get my active order list
     *
     * GET /open-api/order/list
     * Testnet: https://api-testnet.bybit.com/open-api/order/list
     * Mainnet: https://api.bybit.com/open-api/order/list
     */
    GetActiveOrder: ByBitApiContract<
        {
            /** Order ID */
            order_id?: string,
            /** Customized order ID */
            order_link_id?: string,
            /** Contract type. Default BTCUSD */
            symbol?: Symbol,
            /** Sort orders by creation date */
            order?: SortOrder,
            /** Page. Default getting first page data */
            page?: number,
            /** Limit for data size per page, max size is 50. Default as showing 20 pieces of data per page */
            limit?: number,
            /** Query your orders for all statuses if 'order_status' is empty. If you want to query orders with specific statuses , you can pass the order_status split by ','. */
            order_status?: string
        },
        {
            data: Array<{
                /** Unique order ID */
                order_id: string,
                /** User ID */
                user_id: number,
                /** Contract type */
                symbol: Symbol,
                /** Side */
                side: Side,
                /** Order type */
                order_type: OrderType,
                /** Order price */
                price: number,
                /** Order quantity */
                qty: number,
                /** Time in force */
                time_in_force: TimeInForce,
                /** Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled */
                order_status: OrderStatus,
                /** Last execution time */
                last_exec_time: number,
                /** Last execution price */
                last_exec_price: number,
                /** Remaining order quantity */
                leaves_qty: number,
                /** Accumulated execution quantity */
                cum_exec_qty: number,
                /** Accumulated execution value */
                cum_exec_value: number,
                /** Accumulated execution fee */
                cum_exec_fee: number,
                /** Reason for rejection */
                reject_reason: string,
                /** Agency customized order ID */
                order_link_id: string,
                created_at: Timestamp,
                updated_at: Timestamp
            }>,
            current_page: 1,
            total: 1
        }
    >;

    /**
     * 'order_id' is required for cancelling active order. The unique 36 characters order ID was returned to you when the active order was created successfully. 'symbol' is recommend filled, Otherwise, there will be a small probability of failure.
     *
     * You may cancel active order that are unfilled and partially filled. Fully filled order cannot be cancelled.
     *
     * POST /open-api/order/cancel
     * Testnet https://api-testnet.bybit.com/open-api/order/cancel
     * Mainnet https://api.bybit.com/open-api/order/cancel
     */
    CancelActiveOrder: ByBitApiContract<
        {
            /** Your active order ID. The unique order ID returned to you when the corresponding active order was created */
            order_id: string,
            /** Contract type. */
            symbol?: Symbol
        },
        {
            /** Unique order ID */
            order_id: string,
            /** User ID */
            user_id: number,
            /** Contract type */
            symbol: Symbol,
            /** Side */
            side: Side,
            /** Order type */
            order_type: OrderType,
            /** Order price */
            price: number,
            /** Order quantity */
            qty: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled */
            order_status: OrderStatus,
            /** Last execution time */
            last_exec_time: number,
            /** Last execution price */
            last_exec_price: number,
            /** Remaining order quantity */
            leaves_qty: number,
            /** Accumulated execution quantity */
            cum_exec_qty: number,
            /** Accumulated execution value */
            cum_exec_value: number,
            /** Accumulated execution fee */
            cum_exec_fee: number,
            /** Reason for rejection */
            reject_reason: string,
            /** Agency customized order ID */
            order_link_id: string,
            created_at: Timestamp,
            updated_at: Timestamp
        }
    >;

    /**
     * Parameters of 'side', 'symbol', 'order_type', 'qty', 'price', 'base_price', 'stop_px', 'time_in_force' are required for all active orders. Other parameters are optional unless specified.
     *
     * Market price conditional order: A traditional market price order, will be filled at the best available price. 'price' and 'time_in_force' can set to be "" if and only if you are placing market price order.
     *
     * Limit price conditional order: You can set an execution price for your order. Only when last traded price reaches the order price, the system will fill your order.
     *
     * Take profit/Stop loss: You may only set a take-profit/stop-loss conditional order upon opening the position. Once you hold a position, the take profit and stop loss information u sent when placing an order will no longer be valid.
     *
     * Order quantity: This parameter indicates the quantity of perpetual contracts you want to buy or sell, currently Bybit only support order quantity in an integer.
     *
     * Order price: This parameter indicates the price of perpetual contracts you want to buy or sell, currently Bybit only support price increment of every 0.5.
     *
     * Conditional order trigger price: You may set a trigger price for your conditional order. conditional order will not enter the order book until the last price hits the trigger price. When last price hits trigger price: 1) your limit conditional order will enter order book, and wait to be executed; 2) your market conditional order will be executed immediately at the best available market price.
     *
     * Customize conditional order ID: You may customize order IDs for active orders. We will link it to the system order ID , and return the unique system order ID to you after the active order is created successfully. You may use this order ID to cancel your active order. The customized order ID is asked to be unique, with a maximum length of 36 characters.
     *
     * Note: Take profit/Stop loss is not supported in placing conditional orders. One can only use these 2 functions when placing active orders. Moreover, each account can hold up to 10 conditional orders yet to be filled entirely simultaneously.
     *
     * POST /open-api/stop-order/create
     * Testnet https://api-testnet.bybit.com/open-api/stop-order/create
     * Mainnet https://api.bybit.com/open-api/stop-order/create
     */
    PlaceConditionalOrder: ByBitApiContract<
        {
            /** Side. */
            side: Side,
            /** Contract type. */
            symbol: Symbol,
            /** Conditional order type. */
            order_type: OrderType,
            /** Order quantity. */
            qty: number,
            /** Execution price for conditional order */
            price: number,
            /** Send current market price. It will be used to compare with the value of 'stop_px', to decide whether your conditional order will be triggered by crossing trigger price from upper side or lower side. Mainly used to identify the expected direction of the current conditional order. */
            base_price: number,
            /** Trigger price */
            stop_px: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** close on trigger */
            close_on_trigger?: boolean,
            /** Customized order ID, maximum length at 36 characters, and order ID under the same agency has to be unique. */
            order_link_id?: string
        },
        {
            /** Unique order ID */
            stop_order_id: string,
            /** User ID */
            user_id: number,
            /** Order status: Untriggered: order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed */
            stop_order_status: string,
            /** Contract type */
            symbol: Symbol,
            /** Side */
            side: Side,
            /** Price type */
            orde_type: OrderType,
            /** Order price */
            price: number,
            /** Order quantity */
            qty: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** Order type */
            stop_order_type: string,
            /**  */
            base_price: number,
            /** trigger price */
            stop_px: number,
            /** Agency customized order ID */
            order_link_id: string,
            created_at: Timestamp,
            updated_at: Timestamp
        }
    >;

    /**
     * Get my conditional order list。
     *
     * GET /open-api/stop-order/list
     * Testnet https://api-testnet.bybit.com/open-api/stop-order/list
     * Mainnet https://api.bybit.com/open-api/stop-order/list
     */
    GetConditionalOrder: ByBitApiContract<
        {
            /** Order ID of conditional order */
            stop_order_id?: string,
            /** Agency customized order ID */
            order_link_id?: string,
            /** Contract type. Default BTCUSD */
            symbol?: Symbol,
            /** Sort orders by creation date */
            order?: SortOrder,
            /** Page. Default getting first page data */
            page?: number,
            /** Limit for data size per page, max size is 50. Default as showing 20 pieces of data per page */
            limit?: number
        },
        {
            data: Array<{
                /** Unique order ID */
                stop_order_id: string,
                /** User ID */
                user_id: number,
                /** Order status: Untriggered: Pending order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed */
                stop_order_status: string,
                /** Contract type */
                symbol: Symbol,
                /** Side */
                side: Side,
                /** Price type */
                orde_type: OrderType,
                /** Order price */
                price: number,
                /** Order quantity */
                qty: number,
                /** Time in force */
                time_in_force: TimeInForce,
                /** Order type */
                stop_order_type: string,
                /**  */
                base_price: number,
                /** trigger price */
                stop_px: number,
                /** Agency customized order ID */
                order_link_id: string,
                created_at: Timestamp,
                updated_at: Timestamp
            }>,
            current_page: 1,
            total: 1
        }
    >;

    /**
     * 'stop_order_id' is required for cancelling conditional order. The unique 36 characters order ID was returned to you when the condional order was created successfully.
     *
     * You may cancel all untriggered conditional orders. Essentially, after a conditional order is triggered, it will become an active order. So, when a conditional order is triggered, cancellation has to be done through the active order port for all unfilled or partial filled active order. Similarly, order that has been fully filled cannot be cancelled.
     *
     * POST /open-api/stop-order/cancel
     * Testnet https://api-testnet.bybit.com/open-api/stop-order/cancel
     * Mainnet https://api.bybit.com/open-api/stop-order/cancel
     */
    CancelConditionalOrder: ByBitApiContract<
        {
            /** Order ID. The unique order ID returned to you when the corresponding order was created. */
            stop_order_id: string
        },
        {
            /** Unique order ID */
            stop_order_id: string,
            /** User ID */
            user_id: number,
            /** Order status: Untriggered: order waits to be triggered; Triggered: order is triggered; Cancelled: order is cancelled, Active: order is triggered and placed successfully; Rejected: Order is triggered but fail to be placed */
            stop_order_status: StopOrderStatus,
            /** Contract type */
            symbol: Symbol,
            /** Side */
            side: Side,
            /** Price type */
            orde_type: OrderType,
            /** Order price */
            price: number,
            /** Order quantity */
            qty: number,
            /** Time in force */
            time_in_force: TimeInForce,
            /** Order type */
            stop_order_type: string,
            /**  */
            base_price: number,
            /** trigger price */
            stop_px: number,
            /** Agency customized order ID */
            order_link_id: string,
            created_at: Timestamp,
            updated_at: Timestamp
        }
    >;

    /**
     * Get user leverage
     *
     * GET /user/leverage
     * Testnet https://api-testnet.bybit.com/user/leverage
     * Mainnet https://api.bybit.com/user/leverage
     */
    UserLeverage: ByBitApiContract<{}, { [key in Symbol]: { leverage: number } }>;

    /**
     * Change user leverage
     *
     * POST /user/leverage/save
     * Testnet https://api-testnet.bybit.com/user/leverage/save
     * Mainnet https://api.bybit.com/user/leverage/save
     */
    ChangeUserLeverage: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol,
            /** leverage */
            leverage: string
        },
        null
    >;

    /**
     * Get my position list
     *
     * GET /position/list
     * Testnet https://api-testnet.bybit.com/position/list
     * Mainnet https://api.bybit.com/position/list
     */
    MyPosition: ByBitApiContract<{},
        Array<{
            /** position ID */
            id: number,
            /** user ID */
            user_id: number,
            /** risk limit ID */
            risk_id: number,
            /** Contract type */
            symbol: Symbol,
            /** position Side  (None, buy, sell) */
            side: Side | "None",
            /** position size */
            size: Int,
            /** position value */
            position_value: number,
            /** entry price */
            entry_price: number,
            /** user leverage */
            leverage: 1,
            /** auto margin replenishment switch */
            auto_add_margin: IntBoolean,
            /** position margin */
            position_margin: number,
            /** liquidation price */
            liq_price: number,
            /** bankruptcy price */
            bust_price: number,
            /** position closing */
            occ_closing_fee: number,
            /** funding fee */
            occ_funding_fee: number,
            /** take profit price */
            take_profit: number,
            /** stop loss price */
            stop_loss: number,
            /** trailing stop point */
            trailing_stop: number,
            /** Status Normal (normal), Liq (Liquidation in process), ADL (ADL in process) */
            position_status: PositionStatus,
            deleverage_indicator: number,
            oc_calc_data: string,
            /** Used margin by order */
            order_margin: number,
            /** wallet balance */
            wallet_balance: number,
            /** unrealised profit and loss */
            unrealised_pnl: number,
            /** daily realized profit and loss */
            realised_pnl: number,
            /** Total realized profit and loss */
            cum_realised_pnl: number,
            /** Total commissions */
            cum_commission: number,
            /**  */
            cross_seq: number,
            /** position sequence number */
            position_seq: number,
            created_at: Timestamp,
            updated_at: Timestamp

        }>
    >;

    /**
     * Update margin
     *
     * POST /position/change-position-margin
     * Testnet https://api-testnet.bybit.com/position/change-position-margin
     * Mainnet https://api.bybit.com/position/change-position-margin
     */
    ChangePositionMargin: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol,
            /** margin */
            margin: string
        },
        null
    >;

    /**
     * Set Trading-Stop Condition
     *
     * POST /open-api/position/trading-stop
     * Testnet https://api-testnet.bybit.com/open-api/position/trading-stop
     * Mainnet https://api.bybit.com/open-api/position/trading-stop
     */
    SetTradingStop: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol,
            /** Not less than 0, 0 means cancel TP */
            take_profit?: string,
            /** Not less than 0, means cancel SL */
            stop_loss?: string,
            /** Not less than 0, means cancel TS */
            trailing_stop?: string
        },
        {
            id: number,
            user_id: number,
            symbol: Symbol,
            side: Side,
            size: number,
            position_value: number,
            entry_price: number,
            risk_id: number,
            auto_add_margin: IntBoolean,
            leverage: number,
            position_margin: number,
            liq_price: number,
            bust_price: number,
            occ_closing_fee: number,
            occ_funding_fee: number,
            take_profit: number,
            stop_loss: number,
            trailing_stop: number,
            position_status: PositionStatus,
            deleverage_indicator: number,
            oc_calc_data: string,
            order_margin: number,
            wallet_balance: number,
            realised_pnl: number,
            cum_realised_pnl: number,
            cum_commission: number,
            cross_seq: number,
            position_seq: number,
            created_at: Timestamp,
            updated_at: Timestamp
        }
    >;

    /**
     * Get wallet fund records
     *
     * GET /open-api/wallet/fund/records
     * Testnet https://api-testnet.bybit.com/open-api/wallet/fund/records
     * Mainnet https://api.bybit.com/open-api/wallet/fund/records
     */
    GetWalletFundRecords: ByBitApiContract<
        {
            /** Start point for result */
            start_date?: string,
            /** End point for result */
            end_date?: string,
            /** Contract type */
            currency?: string,
            /** Contract type */
            wallet_fund_type?: string,
            /** Page. Default getting first page data */
            page?: number,
            /** Limit for data size per page, max size is 50. Default as showing 20 pieces of data per page */
            limit?: number
        },
        {
            data: Array<{
                id: 128495,
                user_id: 103669,
                coin: Currency,
                wallet_id: 14760,
                type: string,
                amount: number,
                tx_id: string,
                address: Symbol,
                wallet_balance: number,
                exec_time: Timestamp,
                cross_seq: number
            }>
        }
    >;

    /**
     * Funding rate is generated every 8 hours at 00:00 UTC, 08:00 UTC and 16:00 UTC. If it's 12:00 UTC now, what you will get is the funding rate generated at 08:00 UTC.
     *
     * GET /open-api/funding/prev-funding-rate
     * Testnet https://api-testnet.bybit.com/open-api/funding/prev-funding-rate
     * Mainnet https://api.bybit.com/open-api/funding/prev-funding-rate
     */
    GetTheLastFundingRate: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol
        },
        {
            symbol: Symbol,
            /**  When the funding rate is positive, longs pay shorts. When it is negative, shorts pay longs. */
            funding_rate: StringWrapped<number>,
            /**  The time of funding rate generation, UTC timestamp */
            funding_rate_timestamp: 1539950401
        }
    >;

    /**
     * Funding settlement occurs every 8 hours at 00:00 UTC, 08:00 UTC and 16:00 UTC. The current interval's fund fee settlement is based on the previous interval's fund rate. For example, at 16:00, the settlement is based on the fund rate generated at 8:00. The fund rate generated at 16:00 will be used at 0:00 on the next day.
     *
     * GET /open-api/funding/prev-funding
     * Testnet https://api-testnet.bybit.com/open-api/funding/prev-funding
     * Mainnet https://api.bybit.com/open-api/funding/prev-funding
     */
    GetMyLastFundingFee: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol
        },
        {
            symbol: Symbol,
            /**  Your position side at the time of settlement */
            side: Side,
            /**  Your position size at the time of settlement */
            size: number,
            /**  Funding rate for settlement. When the funding rate is positive, longs pay shorts. When it is negative, shorts pay longs. */
            funding_rate: StringWrapped<number>,
            /**  Funding fee. */
            exec_fee: number,
            /**  The time of funding settlement occurred, UTC timestamp */
            exec_timestamp: UtcTimeStamp
        }
    >;

    /**
     * Get predicted funding rate and funding fee
     *
     * GET /open-api/funding/predicted-funding
     * Testnet: https://api-testnet.bybit.com/open-api/funding/predicted-funding
     * Mainnet: https://api.bybit.com/open-api/funding/predicted-funding
     */
    GetPredictedFundingRateAndFundingFee: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol
        },
        {
            /**  predicted funding rate. When the funding rate is positive, longs pay shorts. When it is negative, shorts pay longs. */
            predicted_funding_rate: number,
            /**  predicted funding fee */
            predicted_funding_fee: number
        }
    >;

    /**
     * Get the trade records of a order
     *
     * GET /v2/private/execution/list
     * Testnet: https://api-testnet.bybit.com/v2/private/execution/list
     * Mainnet: https://api.bybit.com/v2/private/execution/list
     */
    GetTheTradeRecordsOfAOrder: ByBitApiContract<
        {
            /** orderID */
            order_id: string
        },
        {
            /**  Unique order ID */
            order_id: string,
            trade_list: Array<{
                /**  Closed size */
                closed_size: number,
                /**  CrossSeq */
                cross_seq: number,
                /**  Execution fee */
                exec_fee: StringWrapped<number>,
                /**  Unique exec ID */
                exec_id: string,
                /**  Exec Price */
                exec_price: StringWrapped<number>,
                /**  Exec Qty */
                exec_qty: number,
                /**  Exec time */
                exec_time: UtcTimeStamp,
                /**  Exec type */
                exec_type: string,
                /**  Exec value */
                exec_value: StringWrapped<number>,
                /**  Fee rate */
                fee_rate: StringWrapped<number>,
                /**  AddedLiquidity/RemovedLiquidity */
                last_liquidity_ind: "AddedLiquidity" | "RemovedLiquidity",
                /**  Leave Qty */
                leaves_qty: number,
                /**  Nth Fill */
                nth_fill: 7,
                /**  Unique order ID */
                order_id: string,
                /**  Order's price */
                order_price: StringWrapped<number>,
                /**  Order's qty */
                order_qty: 1,
                /**  Order's type */
                order_type: OrderType,
                /**  Side */
                side: Side,
                /**  Symbol */
                symbol: Symbol,
                /**  UserID */
                user_id: number
            }>
        }
    >;

    /**
     * Get the orderbook
     * Response is in the snapshot format
     *
     * GET /v2/public/orderBook/L2
     * Testnet: https://api-testnet.bybit.com/v2/public/orderBook/L2
     * Mainnet: https://api.bybit.com/v2/public/orderBook/L2
     */
    GetOrderbook: ByBitApiContract<
        {
            /** Contract type */
            symbol: Symbol
        },
        Array<{
            /** symbol */
            symbol: Symbol,
            /** price */
            price: number,
            /** size (in USD contracts) */
            size: number,
            /** side */
            side: Side
        }>
    >;

    /**
     * Get the latest information for symbol
     *
     * GET /v2/public/tickers
     * Testnet: https://api-testnet.bybit.com/v2/public/tickers
     * Mainnet: https://api.bybit.com/v2/public/tickers
     */
    LatestInformationForSymbol: ByBitApiContract<
        null,
        Array<{
            /** instrument name */
            symbol: Symbol,
            /** the bid price */
            bid_price: StringWrapped<number>,
            /** the ask price */
            ask_price: StringWrapped<number>,
            /** the latest price */
            last_price: StringWrapped<number>,
            /** the direction of last tick:PlusTick,ZeroPlusTick,MinusTick,ZeroMinusTick */
            last_tick_direction: LastTickDirection,
            /** the price of prev 24h */
            prev_price_24h: StringWrapped<number>,
            /** the current last price percentage change from prev 24h price */
            price_24h_pcnt: StringWrapped<number>,
            /** the highest price of prev 24h */
            high_price_24h: StringWrapped<number>,
            /** the lowest price of prev 24h */
            low_price_24h: StringWrapped<number>,
            /** the price of prev 1h */
            prev_price_1h: StringWrapped<number>,
            /** the current last price percentage change from prev 1h price */
            price_1h_pcnt: StringWrapped<number>,
            /** mark price */
            mark_price: StringWrapped<number>,
            /** index price */
            index_price: StringWrapped<number>,
            /** open interest quantity - updates every minute (updates may be more frequent than every 1 minute) */
            open_interest: number,
            /** open value quantity - updates every minute (updates may be more frequent than every 1 minute) */
            open_value: StringWrapped<number>,
            /** total turnover */
            total_turnover: StringWrapped<number>,
            /** 24h turnover */
            turnover_24h: StringWrapped<number>,
            /** total volume */
            total_volume: number,
            /** 24h volume */
            volume_24h: number,
            /** funding rate */
            funding_rate: StringWrapped<number>,
            /** predicted funding rate */
            predicted_funding_rate: StringWrapped<number>,
            /** next funding time */
            next_funding_time: Timestamp,
            /** the rest time to settle funding fee */
            countdown_hour: number
        }>
    >;

    /**
     * Get kline objects
     *
     * GET /v2/public/kline/list
     * Testnet: https://api-testnet.bybit.com/v2/public/kline/list
     * Mainnet: https://api.bybit.com/v2/public/kline/list
     */
    Kline: ByBitApiContract<
        {
            from: number,
            to: number,
            symbol: Symbol,
            interval: string
        },
        Array<{
            symbol: Symbol,
            interval: string,
            open_time: number,
            open: StringWrapped<number>,
            high: StringWrapped<number>,
            low: StringWrapped<number>,
            close: StringWrapped<number>,
            volume: StringWrapped<number>,
            turnover: StringWrapped<number>
        }>
    >;

}