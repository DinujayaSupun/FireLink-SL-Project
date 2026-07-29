import { CheckIcon, TrashIcon, XIcon } from "lucide-react";
import React from "react";

function ConfirmDeletion({ handleDeleteBid, setShowDeleteConfirm }) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
				<div className="flex items-center justify-center mb-4">
					<div className="w-12 h-12 rounded-full bg-fire-100 flex items-center justify-center">
						<TrashIcon size={24} className="text-fire" />
					</div>
				</div>
				<h3 className="text-lg font-bold text-center mb-2">Confirm Deletion</h3>
				<p className="text-gray-600 text-center mb-6">
					Are you sure you want to delete this? This action cannot be undone.
				</p>
				<div className="flex justify-center space-x-4">
					<button
						className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium flex items-center"
						onClick={() => setShowDeleteConfirm(false)}
					>
						<XIcon size={18} className="mr-2" />
						Cancel
					</button>
					<button
						className="px-5 py-2.5 bg-fire text-white rounded-lg hover:bg-fire-dark font-medium flex items-center"
						onClick={handleDeleteBid}
					>
						<CheckIcon size={18} className="mr-2" />
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmDeletion;
