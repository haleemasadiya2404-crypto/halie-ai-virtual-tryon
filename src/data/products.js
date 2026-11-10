import halieRedGold from "../assets/outfits/halie-red-gold-outfit.jpg";
import partyPink from "../assets/outfits/party-pink-front.jpg";
import burgundyDress from "../assets/outfits/burgundy-rose-gown-front.jpg";
import burgundyGownTryOn from "../assets/outfits/burgundy-gown-tryon.png";
import redGoldTryOn from "../assets/outfits/red-gold-tryon.png";
import pinkBowTryOn from "../assets/outfits/pink-bow-tryon.png";

const products = [
  {
    id: 1,
    name: "HALIÉ Red & Gold Traditional",
    price: "₹1499",
    image: halieRedGold,
    tryOnImage: redGoldTryOn,
    category: "Traditional",
    description:
      "Beautiful red and gold traditional outfit perfect for celebrations and special occasions.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Gold", "Black"],
  },
  {
    id: 2,
    name: "HALIÉ Pink Bow Party Dress",
    price: "₹1299",
    image: partyPink,
    tryOnImage: pinkBowTryOn,
    category: "Party Dress",
    description:
      "Elegant black party dress with a beautiful pink bow detail.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Pink"],
  },
  {
    id: 3,
    name: "HALIÉ Burgundy Rose Gown",
    price: "₹1799",
    image: burgundyDress,
    tryOnImage: burgundyGownTryOn,
    category: "Gown",
    description:
      "A deep burgundy satin ball gown with an off-shoulder neckline, short gathered puff sleeves, a fitted ruched bodice, and a very full floor-length gathered skirt.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Burgundy"],
  },
];

export default products;