"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.renameImage = void 0;
const renameImage = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileName = file.originalname;
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${name}-${randomName}-${fileName}`);
};
exports.renameImage = renameImage;
const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Invalid format type'), false);
    }
    callback(null, true);
};
exports.fileFilter = fileFilter;
//# sourceMappingURL=images.helper.js.map