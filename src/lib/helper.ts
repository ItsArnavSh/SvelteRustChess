

export function mapToNumber(bitmap:bigint)
{
    //We ware given a map and we should return an array of coordinates
    let coordinate:number[]=[];
    for(let i=1;i<=64;i++)
    {
        if((bitmap&1n)==1n)
                coordinate.push(i);
            bitmap=bitmap>>1n;
    }
    return coordinate.map((x)=>64-x);
}
export function mapToString(bitmap:bigint)
{
    if(bitmap==null)
        return [];
    //It takes the bitmap of the board, and returns an array of coordinates with the elements which had a 1
    let coordinate = [];
    for(let i=8;i>=1;i--)
    {
        for(let j='a'.charCodeAt(0);j<='h'.charCodeAt(0);j++)
        {
            let id = (`${String.fromCharCode(j)}${i}`);
            if((bitmap&1n)==1n)
                coordinate.push(id);
            bitmap=bitmap>>1n;
        }
    }
    return coordinate;
}
export function coordToNum(coord:string)
{
    //We will make a formula to convert the string to the numerical notation and then the bit
    let x = charToNumber(coord[0]);
    let y = numcharToNumber(coord[1]);
    return(64-(8*(8-x)+y-1));
}
function charToNumber(c:string) {
    return c.charCodeAt(0) - 'a'.charCodeAt(0)+1;
}
function numcharToNumber(c:string) {
    return c.charCodeAt(0) - '0'.charCodeAt(0);
}
export function numToCoord(num:number)
{
    let index1 = Math.trunc(num/8);
    let index2 = num%8;
    return(String.fromCharCode(97+index2)+(8-index1))
}
export function stringToMap(coord:string)
{
    let numCoord = coordToNum(coord)
    return (0b1n<<BigInt(numCoord-1))
}