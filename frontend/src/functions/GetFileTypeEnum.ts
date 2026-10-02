import FileTypeEnum from "../types/FileTypeEnum";

function GetFileTypeEnum(ext: string): FileTypeEnum {
    if (ext.match(/mp4|wmv|webm|mkv|mov|avi|flv/gi)) return FileTypeEnum.Video;
    if (ext.match(/jpg|jpeg|png|gif|webp|bmp|tiff|ico|svg/gi)) return FileTypeEnum.Image;
    if (ext.match(/mp3|mpeg|wav|ogg|flac|m4a|aac|opus|wma|mid/gi)) return FileTypeEnum.Audio;

    return FileTypeEnum.None;
}

export default GetFileTypeEnum;
