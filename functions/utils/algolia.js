// for the default version
import algoliasearch from "algoliasearch";

// or just use algolia search if you are using a <script> tag
// if you are using AMD module loader, algoliasearch will not be defined in window,
// but in the AMD modules of the page

const client = algoliasearch("PKUK071X53", "361b37434cba39a0c449070cd87f35e2");
const index = client.initIndex("local_smartbell");
export default index;
