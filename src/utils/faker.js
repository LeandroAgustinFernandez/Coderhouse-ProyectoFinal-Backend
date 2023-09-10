import { faker } from '@faker-js/faker/locale/es'

export const generateProduct = () => {
    let numberOfImages = parseInt(faker.random.numeric(1, { bannedDigits: ['0'] }));
    let images = [];
    for (let i = 0; i < numberOfImages; i++) {
      images.push(faker.image.url());
    }

    return { 
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price() ,
      thumbnails: images,
      code: faker.random.alphaNumeric(6),
      stock: faker.random.numeric(2), 
      category: faker.commerce.productAdjective(),
      status: faker.datatype.boolean()
    }
}