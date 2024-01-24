function getRandomValue(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function expensiveHeavyTask() {
    const ms = getRandomValue([100,150,200, 300]);
    const shouldThrowerror = getRandomValue([1,2,3,4,5,6,7,8,]) === 8;

    if(shouldThrowerror){
        const randomError = getRandomValue([
            "Payment Failure",
            "DB Server is Down",
            "Access Denied"
        ]);
        throw new Error(randomError)
    }
    return new Promise((resolve, reject) => setTimeout(() => resolve(ms), ms))
}

module.exports = { expensiveHeavyTask }