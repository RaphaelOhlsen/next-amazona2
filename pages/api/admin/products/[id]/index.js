import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import Product from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
});

handler.put(async (req, res) => {
  const { id } = req.query;
  const {
    name,
    slug,
    price,
    category,
    image,
    featuredImage,
    isFeatured,
    brand,
    countInStock,
    description,
  } = req.body;
  await db.connect();
  const product = await Product.findById(id);
  if (product) {
    product.name = name;
    product.slug = slug;
    product.price = price;
    product.category = category;
    product.image = image;
    product.featuredImage = featuredImage;
    product.isFeatured = isFeatured;
    product.brand = brand;
    product.countInStock = countInStock;
    product.description = description;
    await product.save();
    await db.disconnect();
    res.send({ message: 'Product Updated Successfully!' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product Not Found' });
  }
});

handler.delete(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    await product.remove();
    await db.connect();
    res.send({ message: 'Product Deleted' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product Not FOund ' });
  }
});

export default handler;
