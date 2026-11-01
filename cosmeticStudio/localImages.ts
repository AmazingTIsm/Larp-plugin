export const MAX_LOCAL_IMAGE_BYTES=4*1024*1024;
export function validateLocalImage(file:Pick<File,"size"|"type">){
    if(!["image/png","image/jpeg","image/gif","image/webp"].includes(file.type))throw new Error("Choose a PNG, JPEG, GIF or WebP image.");
    if(file.size>MAX_LOCAL_IMAGE_BYTES)throw new Error("Choose an image smaller than 4 MB.");
    if(!file.size)throw new Error("This image file is empty.");
}
export function readLocalImage(file:File):Promise<string>{
    validateLocalImage(file);
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("The image could not be read."));reader.readAsDataURL(file);});
}
