Create a "Featured Products" Component in this Agility instance (c23abe0e-u) and next.js project

Use this component as a starting point: src/components/featured-products.tsx

Create an Agility Component Model for the content. Allow the user to choose which products show up using a search list box linked content field that is tied to the "Products" list container.

IMPORTANT: When using a search list box linked content field in Agility CMS, the field will automatically contain an array of ContentItem<IProduct> objects. You do NOT need to fetch the products separately using getContentList. The TypeScript interface should reflect this by defining the field as: `fieldName: ContentItem<IProduct>[]`

Follow the patterns I've already setup in this project. Use the <AgilityPic /> component for images

Create the Agility Component first, then do all the code work so I can configure the component on a page while you work on the code.
