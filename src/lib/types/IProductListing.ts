export interface IProductListing {
	heading: string
	description: string
	displayStyle: string // 'grid' or 'list'
	itemsPerRow: string // '2', '3', '4'
	limitToCategories: string // comma-separated category IDs
	showFilters: string // 'true' or 'false'
	showSortOptions: string // 'true' or 'false'
	ctaLabel: string
}
