function RemoveDuplicates<T>(array: Array<T>, useState_SetCall: any, keyToCheck: string) {
    let arr: Array<T> = [];
    useState_SetCall((old: Array<T>) => {
        const rr = [...old, ...array];
        arr = rr;
        return rr;
    });
    console.log(arr);

    arr = arr.filter(
        (value, index, self) => index === self.findIndex((t: any) => t[keyToCheck] === (value as any)[keyToCheck])
    );
    useState_SetCall(arr);
}

export default RemoveDuplicates;
