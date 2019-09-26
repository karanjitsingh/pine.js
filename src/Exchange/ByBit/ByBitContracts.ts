import { Side, OrderType } from "Model/Exchange/Orders";

export namespace Api {

    export type Symbol = 'BTCUSD' | 'ETHUSD' | 'XRPUSD' | 'EOSUSD';
    export type TimeInForce = "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill" | "PostOnly"
    export type PositionStatus = 'Normal' | 'Liq' | 'Adl'

    export interface Order {
        side: Side                     // Side
        symbol: Symbol                      // Contract type.
        order_type: OrderType               // Active order type
        qty: number                         // Order quantity.
        price: number                       // Order price.
        time_in_force: TimeInForce          // Time in force
        take_profit?: number                // take profit price
        stop_loss?: number                  // stop loss price
        reduce_only?: boolean               // reduce only
        close_on_trigger?: boolean          // close on trigger
        order_link_id?: string              // Customized order ID, maximum length at 36 characters, and order ID under the same agency has to be unique.
    }

    export interface PositionResponse {
        id: number,                         //position ID
        user_id: number,                    //user ID
        risk_id: number,                    //risk limit ID
        symbol: Symbol,                     //Contract type
        side: Side | 'None',           //position Side  (None, buy, sell)
        size: number,                       //position size
        position_value: number,             //position value
        entry_price: number,                //entry price
        leverage: number,                   //user leverage
        auto_add_margin: boolean,            //auto margin replenishment switch
        position_margin: number,            //position margin
        liq_price: number,                  //liquidation price
        bust_price: number,                 //bankruptcy price
        occ_closing_fee: number,            //position closing
        occ_funding_fee: number,            //funding fee
        take_profit: number,                //take profit price
        stop_loss: number,                  //stop loss price
        trailing_stop: number,              //trailing stop point
        position_status: PositionStatus,    //Status Normal (normal), Liq (Liquidation in process), ADL (ADL in process)
        deleverage_indicator: number,
        oc_calc_data: any,
        order_margin: number,               //Used margin by order
        wallet_balance: number,             //wallet balance
        unrealised_pnl: number,             //unrealised profit and loss
        realised_pnl: number,               //daily realized profit and loss
        cum_realised_pnl: number,           //Total realized profit and loss
        cum_commission: number,             //Total commissions
        cross_seq: number,                  //
        position_seq: number,               //position sequence number
        created_at: string,
        updated_at: string
    }

    export interface OrderResponse {
        order_id: string,                   // Unique order ID
        user_id: number,                    // User ID
        symbol: string,                     // Contract type
        side: string,                       // Side
        order_type: string,                 // Order type
        price: number,                      // Order price
        qty: number,                        // Order quantity
        time_in_force: string,              // Time in force
        order_status: string,               // Order status: Created: order created; Rejected: order rejected; New: order pending; PartiallyFilled: order filled partially; Filled: order filled fully, Cancelled: order cancelled
        last_exec_time: number,             // Last execution time
        last_exec_price: number,            // Last execution price
        leaves_qty: number,                 // Remaining order quantity
        cum_exec_qty: number,               // Accumulated execution quantity
        cum_exec_value: number,             // Accumulated execution value
        cum_exec_fee: number,               // Accumulated execution fee
        reject_reason: string,              // Reason for rejection
        order_link_id: string,              // Agency customized order ID
        created_at:string,
        updated_at:string,
    }

    export interface CandleResult {
        id: number,
        symbol: string,
        period: string,
        start_at: number,
        open: number,
        high: number,
        low: number,
        close: number,
        volume: number,
        turnover: number,
        cross_seq: number,
        time: number
    }

    export interface SymbolResponse {
        ret_code: number,
        ret_msg: string,
        ext_code: number,
        result: CandleResult[]
    }

    // export const Transform()

}