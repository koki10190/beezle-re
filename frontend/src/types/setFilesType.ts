import FileTypeEnum from "./FileTypeEnum";

type SetFilesType = React.Dispatch<React.SetStateAction<{ file: File; type: FileTypeEnum }[]>>;
export default SetFilesType;
