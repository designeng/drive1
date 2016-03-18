function controller(topStories, topVideos, topBlogs, cellar) {
    console.log("cellar:::::::", cellar);

    return {
        html        : "should be formed later",
        topNews     : topStories['topNews'],
        mainNews    : topStories['mainNews'],
        topVideos, 
        topBlogs, 
        cellar
    }
}

export default controller;