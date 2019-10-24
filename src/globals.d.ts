import { Int } from "Model/Contracts";

declare global {
    interface Number {
        /**
          * Returns Math.floor of the number.
          */
        toInt(): Int;
    }    
}
