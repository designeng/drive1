export default function controller(brandsList) {
    brandsList().then(context => {
        console.log("brandsList >>>>>>", context);
    }).otherwise(error => {
        console.log("brandsList ERROR >>>>>>", error);
    })
}