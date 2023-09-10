export default class CartRepository {
  constructor(DAO) {
    this.DAO = DAO;
  }

  getCart = async (id) => await this.DAO.get(id);
  createCart = async () => await this.DAO.create();
  updateProducts = async (cid, products) => await this.DAO.updateProducts(cid, products);
  deleteAllProducts = async (id) => await this.DAO.deleteAllProducts(id);
  addProductToCart = async (cid, pid) => await this.DAO.addProductToCart(cid, pid);
  updateProductQuantity = async (cid, pid, quantity) => await this.DAO.updateProductQuantity(cid, pid, quantity);
  deleteProduct = async (cid, pid) => await this.DAO.deleteProduct(cid, pid);
}
