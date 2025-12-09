import { Button } from '@/components/button'
import { Link } from '@/components/link'
import { localizeUrl } from '@/lib/i18n/localizeUrl'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'

interface PaginationProps {
	page: number
	category?: string
	sort?: string
	totalProducts: number
	productsPerPage: number
	languageCode: string
	basePath?: string
}

export async function Pagination({
	page,
	category,
	sort,
	totalProducts,
	productsPerPage,
	languageCode,
	basePath = '/products'
}: PaginationProps) {
	function url(page: number) {
		const params = new URLSearchParams()

		if (category && category !== 'all') {
			params.set('category', category)
		}
		if (sort && sort !== 'default') {
			params.set('sort', sort)
		}
		if (page > 1) {
			params.set('page', page.toString())
		}

		const theUrl = params.size !== 0 ? `${basePath}?${params.toString()}` : basePath

		return localizeUrl(theUrl, languageCode)
	}

	const hasPreviousPage = page > 1
	const previousPageUrl = hasPreviousPage ? url(page - 1) : undefined
	const hasNextPage = page * productsPerPage < totalProducts
	const nextPageUrl = hasNextPage ? url(page + 1) : undefined
	const pageCount = Math.ceil(totalProducts / productsPerPage)

	if (pageCount < 2) {
		return null
	}

	return (
		<div className="mt-12 flex items-center justify-between gap-2">
			<Button
				variant="outline"
				href={previousPageUrl}
				disabled={!previousPageUrl}
			>
				<ChevronLeftIcon className="size-4" />
				Previous
			</Button>
			<div className="flex gap-2 max-sm:hidden">
				{Array.from({ length: pageCount }, (_, i) => (
					<Link
						key={i + 1}
						href={url(i + 1)}
						data-active={i + 1 === page ? true : undefined}
						className={clsx(
							'min-w-10 px-3 py-2 rounded-lg text-center text-sm font-medium',
							'data-hover:bg-gray-100 dark:data-hover:bg-gray-800 transition-colors',
							'data-active:bg-black data-active:text-white dark:data-active:bg-white dark:data-active:text-black',
							'data-active:data-hover:bg-gray-800 dark:data-active:data-hover:bg-gray-200',
						)}
					>
						{i + 1}
					</Link>
				))}
			</div>
			<Button variant="outline" href={nextPageUrl} disabled={!nextPageUrl}>
				Next
				<ChevronRightIcon className="size-4" />
			</Button>
		</div>
	)
}
