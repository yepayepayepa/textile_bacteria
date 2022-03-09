function calculateFeatures() {
    let background = pseudorandom.weightedPick(["Lighter", "Darker"], [1, 7]);
    let size = pseudorandom.pick(["Small", "Large"]);
    let thread = pseudorandom.pick(["Thin", "Normal", "Thick"]);

    const features = {
        "Background": background,
        "Size": size,
        "Thread": thread,
    }

    console.log(JSON.stringify(features, null, 4));

    // Sends the features to fxhash for processing
    window.$fxhashFeatures = features;
    return features;
}