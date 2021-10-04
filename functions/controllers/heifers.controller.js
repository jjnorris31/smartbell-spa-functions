import {getRepository} from "fireorm";
import FemaleBovine from "../models/femaleBovine";
import {getConstrainsError, getDefaultError, getFemaleBovines, getLastCalvingEvents} from "../utils/utils";
import index from "../utils/algolia";

export const getHeifers = async (req, res) => {
	const repository = getRepository(FemaleBovine);
	const { limit, page, filter, values, search } = req.query;
	const { ranchId } = req.params;
	try {
		let foundHeifers = [];
		let foundIds = [];

		if (search) {
			const hits = await index.search(search, {
				filters: `ranchIdentifier:${ranchId} AND animalType:HEIFER`
			});

			if (hits.hits.length > 0) {
				foundIds = hits.hits.map(hit => {
					return hit?.internalIdentifier;
				});
			} else {
				return res.status(200).json(getHeifersResponse([], 0));
			}
		}

		if (filter && values) {
			foundHeifers = await getFilteredHeifers(req);
			foundHeifers = search ? foundHeifers.filter(heifer =>  foundIds.includes(heifer.internalIdentifier)) : foundHeifers;
		} else {
			foundHeifers = await getAllHeifers(ranchId, foundIds);
		}

		let cows = [];
		if (limit && page) {
			cows = foundHeifers.slice(limit * (page - 1), limit * (page));
		} else {
			cows = foundHeifers;
		}
		return res.status(200).json(getHeifersResponse(cows, foundHeifers.length));
	} catch (error) {
		const constraintError = getConstrainsError(error[0]?.constraints);
		const responseError = constraintError ? constraintError : getDefaultError(error);
		return res.status(400).json(responseError);
	}
};

/**
 * Gets a filtered array of FemaleBovines from a given ranch identifier
 * @param req a request object
 * @returns {Promise<FemaleBovine[]|*[]|FlatArray<FemaleBovine[][], 1>[]>}
 */
async function getFilteredHeifers(req) {
	const repository = getRepository(FemaleBovine);
	const { limit, page, filter, values } = req.query;
	const { ranchId } = req.params;
	const filterValues = values.split(',');

	switch (filter) {
		case 'BREED':
			return await repository
				.whereEqualTo("ranchIdentifier", ranchId)
				.whereEqualTo("isDead", false)
				.whereEqualTo('deleteAt', null)
				.whereEqualTo("lactationCycle", 0)
				.whereIn("breed", filterValues).find();
		case 'DELETED':
			if (filterValues.includes('DEAD') && filterValues.includes('SOLD')) {
				let isDeadQuery = repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereEqualTo("lactationCycle", 0)
					.whereEqualTo('isDead', true);
				let deleteAtQuery = repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereEqualTo("lactationCycle", 0)
					.whereNotEqualTo('deleteAt', null);
				const promises = [isDeadQuery.find(), deleteAtQuery.find()];
				const responses = await Promise.all(promises);
				return responses.flat();
			} else if (filterValues.includes('DEAD')) {
				return await repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereEqualTo("lactationCycle", 0)
					.whereEqualTo('isDead', true)
					.find();
			} else if (filterValues.includes('SOLD')) {
				return await repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereEqualTo("lactationCycle", 0)
					.whereNotEqualTo('deleteAt', null)
					.find();
			}
			break;
		default:
			return [];
	}
}

/**
 * Gets all the heifers with a given ranch identifier
 * @param ranchId a given ranch identifier
 * * @param foundIds an array of internals ids found by algolia
 * @returns {Promise<FemaleBovine[]>}
 */
async function getAllHeifers(ranchId, foundIds) {
	const repository = getRepository(FemaleBovine);
	const query = repository.whereEqualTo("ranchIdentifier", ranchId)
		.whereEqualTo('deleteAt', null)
		.whereEqualTo("isDead", false)
		.whereEqualTo("lactationCycle", 0);

	return foundIds.length > 0 ? await query.whereIn('internalIdentifier', foundIds).find() : await query.find();

}

function getHeifersResponse(femaleBovines, count) {
	return {
		femaleBovines,
		count
	};
}