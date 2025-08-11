enum PostPageEnum {
    Home,
    RightNow,
    Explore,
}

function EnumToPageAPI(page: PostPageEnum) {
    switch (page) {
        case PostPageEnum.Home:
            return "/api/post/get/following";
        case PostPageEnum.Explore:
            return "/api/post/get/explore";
        case PostPageEnum.RightNow:
            return "/api/post/get/now";
    }
}

function EnumToPageName(page: PostPageEnum) {
    switch (page) {
        case PostPageEnum.Home:
            return "Home";
        case PostPageEnum.Explore:
            return "Explore";
        case PostPageEnum.RightNow:
            return "Right Now";
    }
}

export { PostPageEnum, EnumToPageAPI, EnumToPageName };
