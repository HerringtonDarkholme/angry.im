declare module 'crypto-js' {
  export = CryptoJS
}

declare namespace CryptoJS {
    namespace mode{
        interface ModeStatic{
          IGE: mode.IGE
        }
        interface IBlockCipherModeImpl {
          extend(override?: any): any
        }
        interface IGE extends IBlockCipherModeImpl{}
    }
    namespace lib{
        interface BlockCipherMode extends Base{
            extend(): mode.IBlockCipherModeImpl
        }
        interface LibStatic{
          BlockCipherMode: BlockCipherMode
        }
    }
}

declare module 'BigInt' {
  export = BigInt
}

declare function unescape(str: string): string
declare function escape(str: string): string
