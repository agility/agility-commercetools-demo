"use client"

import { UserCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export function AccountButton() {
	return (
		<Link
			href="/account"
			className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
			aria-label="Account"
		>
			<UserCircleIcon className="size-6" />
		</Link>
	)
}
