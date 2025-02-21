
const findTheIndex = (numbersArray, theNumber) => {
    let newArrayStartingIndex = 0, newArrayEndingIndex = numbersArray.length - 1, midIndex;
    let theIndex = 0, found = false;
    while (1) {
        if (newArrayStartingIndex === newArrayEndingIndex) break;
        if ((newArrayStartingIndex +1) === newArrayEndingIndex){
            break;
        } 
        midIndex = Math.floor((newArrayStartingIndex + newArrayEndingIndex) / 2);
        if (theNumber < numbersArray[midIndex]) {
            newArrayEndingIndex = midIndex;
        } else if (theNumber > numbersArray[midIndex]) {
            newArrayStartingIndex = midIndex;
        } else {
            found = true;
            theIndex = midIndex;
            break;
        }
    }
    if (!found) {
        if (theNumber > numbersArray[newArrayEndingIndex]) {
            theIndex = newArrayEndingIndex + 1;
        } else if (theNumber < numbersArray[newArrayStartingIndex]) {
            theIndex = newArrayStartingIndex ? newArrayStartingIndex - 1 : 0;
        } else {
            theIndex = newArrayStartingIndex + 1 ;
        }
    }
    if(theIndex) {
        if((theNumber === numbersArray[theIndex-1]) || (theNumber === numbersArray[theIndex]) || (theNumber === numbersArray[theIndex+1])) {
            theIndex = -1;
        }
    } else {
        if((theNumber === numbersArray[theIndex]) || (theNumber === numbersArray[theIndex+1])) {
            theIndex = -1;
        }
    }
    return theIndex;
}
let index;

let numbers = [1, 2, 3, 5, 7, 10, 15];
let newNmuber = 1;
theIndex = findTheIndex(numbers, newNmuber);
console.log(`${theIndex}`)
if(theIndex !== -1) {
    numbers.splice(theIndex, 0, newNmuber)
}
console.log(numbers);
