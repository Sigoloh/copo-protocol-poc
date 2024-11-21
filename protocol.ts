const STX = Uint8Array.from([0x02]);
const ETX = Uint8Array.from([0x03]);
const EM = Uint8Array.from([0x19]);
const RS = Uint8Array.from([0x1e]);

export class Protocol {
  private static strToUint8Arr(str: string): Uint8Array {
    const arr: number[] = [];

    for(const char of str){
      arr.push(char.charCodeAt(0));
    }

    return Uint8Array.from(arr);
  }

  private static Uint8ArrToStr(arr: Uint8Array): string {
    let str = '';

    const array = Array.from(arr);

    for(const char of array){
      str += String.fromCharCode(char);
    }

    return str;
  }

  private static joinParts(...parts: Uint8Array[]): Uint8Array{
    const arr: number[] = [];

    for(const part of parts){
      arr.push(
        ...Array.from(part)
      );
    }

    return Uint8Array.from(arr);
  }

  static encodeInteger(integer: number): Uint8Array {
    const signal = integer < 0 ? '-' : '+';

    const integerStr = integer.toString();

    const arr: number[] = [];

    arr.push(
      ':'.charCodeAt(0),
      signal.charCodeAt(0),
      2
    );

    for(const char of integerStr){
      arr.push(parseInt(char));
    }

    arr.push(19);

    return Uint8Array.from(arr);
  }

  static decodeInteger(integerBuff: Uint8Array): number {
    const integerArr = Array.from(integerBuff);
    const signalByte = integerArr.shift();

    if(!signalByte){
      throw new Error("Invalid integer buffer. Expected: : Found: undefined");
    }

    const signal = String.fromCharCode(signalByte);

    let numStr = `${signal}`;

    for(const number of integerArr){
      numStr += number;
    }

    console.log(numStr);

    return parseInt(numStr);
  }

  static decodeNamedValue(buff: Uint8Array){
    const arr = Array.from(buff); 
    const typeCharCode = arr.shift();

    if(!typeCharCode){
      throw new Error("Invalid named value. Expected: @ Found: undefined");
    }

    const typeChar = String.fromCharCode(typeCharCode);

    if(typeChar !== '@'){
      throw new Error(`Invalid named value. Expected: @ Found: ${typeChar}`);
    }

    const firstStxIdx = arr.indexOf(2);
    const firstEtxIdx = arr.indexOf(3);


    if(firstStxIdx === -1 || firstEtxIdx === -1){
      throw new Error(`Buffer malformated`);
    }

    const secondStxIdx = arr.indexOf(2, firstStxIdx + 1);
    const secondEtxIdx = arr.indexOf(3, firstStxIdx + 1);

    if(secondStxIdx === -1 || secondEtxIdx === -1){
      throw new Error(`Buffer malformated`);
    }

    const name = arr.slice(firstStxIdx + 1, firstEtxIdx);
    const value = arr.slice(secondStxIdx + 1, secondEtxIdx);

    console.log(name);
    console.log(value);

    const strName = this.Uint8ArrToStr(Uint8Array.from(name));
    const parsedValue = this.decodeInteger(Uint8Array.from(value));

    return {
      name: strName,
      value: parsedValue
    }
  }

  static encodeNumber(num: number): Uint8Array {
    const isInteger = Number.isInteger(num);

    if(!isInteger){
      throw new Error('Not implemented');
    }

    return this.encodeInteger(num);
  }

  static encodeNamedValue(name: string, value: any): Uint8Array{
    const nameBuf = this.strToUint8Arr(name);
    switch (typeof value) {
      case 'number': 
        return this.joinParts(Buffer.from('@'), STX, nameBuf, ETX, STX, this.encodeNumber(value), ETX, EM);
      default:
        throw new Error('Not implemented')
    }
  }

}