/* eslint-disable radix */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import axios from 'axios';
import Rating from '@mui/material/Rating';
import Pagination from '@mui/material/Pagination';
import Layout from '../components/Layout';
import classes from '../utils/classes';
import db from '../utils/db';
import Product from '../models/Product';
import ProductItem from '../components/ProductItem';
import { Store } from '../utils/Store';

const PAGE_SIZE = 3;

const prices = [
  { name: '$ 2 to $50', value: '1-50' },
  { name: '$ 51 to $200', value: '51-200' },
  { name: '$ 201 to $1000', value: '201-1000' },
];

const ratings = [1, 2, 3, 4, 5];

export default function Search(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'featured',
  } = router.query;

  const { products, countProducts, categories, brands, pages } = props;

  const filterSearch = ({
    page,
    category,
    brand,
    sort,
    min,
    max,
    searchQuery,
    price,
    rating,
  }) => {
    const path = router.pathname;
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: path,
      query,
    });
  };

  const categoryHandler = (ev) => {
    filterSearch({ category: ev.target.value });
  };

  const pageHandler = (ev, page) => {
    filterSearch({ page });
  };

  const brandHandler = (ev) => {
    filterSearch({ brand: ev.target.value });
  };

  const sortHandler = (ev) => {
    filterSearch({ sort: ev.target.value });
  };
  const priceHandler = (ev) => {
    filterSearch({ price: ev.target.value });
  };

  const ratingHandler = (ev) => {
    filterSearch({ rating: ev.target.value });
  };

  async function addToCartHandler(product) {
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id,
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  }

  return (
    <Layout title="Search">
      <Grid sx={classes.mt1} container spacing={1}>
        <Grid item md={3}>
          <List>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Categories</Typography>
                <Select fullWidth value={category} onChange={categoryHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {categories &&
                    categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Brands</Typography>
                <Select fullWidth value={brand} onChange={brandHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {brands &&
                    brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Prices</Typography>
                <Select fullWidth value={price} onChange={priceHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {prices.map((price) => (
                    <MenuItem key={price.value} value={price.value}>
                      {price.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Ratings</Typography>
                <Select fullWidth value={rating} onChange={ratingHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {ratings.map((rating) => (
                    <MenuItem display="flex" key={rating} value={rating}>
                      <Rating value={rating} readOnly />
                      {rating < 5 && (
                        <Typography component="span">&amp; Up</Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={9}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ` : ${query}`}
              {category !== 'all' && ` : ${category}`}
              {brand !== 'all' && ` : ${brand}`}
              {price !== 'all' && ` : Price ${price}`}
              {rating !== 'all' && rating < 5
                ? ` : Rating ${rating} & up`
                : ` : Rating ${rating}`}
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              brand !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <Button onClick={() => router.push('/search')}>
                  <CancelIcon />
                </Button>
              ) : null}
            </Grid>
            <Grid item>
              <Typography component="span" sx={classes.sort}>
                Sort by
              </Typography>
              <Select value={sort} onChange={sortHandler}>
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="lowest">Price: Low to High</MenuItem>
                <MenuItem value="highest">Price: High to Low</MenuItem>
                <MenuItem value="toprated">Customers Reviews</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid sx={classes.section} container spacing={3}>
            {products.map((product, idx) => (
              <Grid item md={4} key={idx}>
                <ProductItem
                  key={idx}
                  product={product}
                  addToCartHandler={addToCartHandler}
                />
              </Grid>
            ))}
          </Grid>
          <Grid container justifyContent="center">
            <Pagination
              sx={classes.section}
              defaultPage={parseInt(query.page || '1')}
              count={pages}
              onChange={pageHandler}
            />
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  await db.connect();
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
  const categoryFilter = category && category !== 'all' ? { category } : {};
  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};

  const order =
    sort === 'featured'
      ? { featured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const categories = await Product.find().distinct('category');
  const brands = await Product.find().distinct('brand');
  const ProductDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    '-reviews',
  )
    .sort(order)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });

  await db.disconnect();

  const products = ProductDocs.map(db.convertDocToObj);

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    },
  };
}
