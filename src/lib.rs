mod utils;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_moves(ar: Vec<i32>) -> Vec<i32> {
    return i64tobigintarray(0b0000000000000000111111110000000000000000000000000000000000000000)
}
fn i64tobigintarray(num: i64) -> Vec<i32> {
    // Get the higher 32 bits
    let high_bits = (num >> 32) as i32;
    // Get the lower 32 bits by applying a mask
    let low_bits = (num & 0xFFFFFFFF) as i32;
    let arr: Vec<i32> = vec![high_bits, low_bits];
    return arr;
}
fn breakToBoard(oldBoard:Vec<i32>)
{

}