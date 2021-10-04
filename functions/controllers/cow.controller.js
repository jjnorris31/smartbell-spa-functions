import {
	getConstrainsError,
	getDefaultError,
	getFemaleBovines,
	getCowsResponse,
	getLastCalvingEvents, getLastPregnantEvents
} from "../utils/utils";
import {getRepository} from "fireorm";
import FemaleBovine from "../models/femaleBovine";
import index from '../utils/algolia';

export const getCows = async (req, res) => {
	const repository = getRepository(FemaleBovine);
	const { limit, page, filter, values, search, group } = req.query;

	const { ranchId } = req.params;
	try {
		let foundCows = [];
		let foundIds = [];

		if (search) {
			const hits = await index.search(search, {
				filters: `ranchIdentifier:${ranchId} AND animalType:COW`
			});

			if (hits.hits.length > 0) {
				foundIds = hits.hits.map(hit => {
					return hit?.internalIdentifier;
				});
			} else {
				return res.status(200).json(getCowsResponse([], 0));
			}
		}

		if (filter && values) {
			foundCows = group ? await getFilteredCowsWithoutGroup(req) : await getFilteredCows(req);
			foundCows = search ? foundCows.filter(cow =>  foundIds.includes(cow.internalIdentifier)) : foundCows;
		} else {
			foundCows = await getAllCows(ranchId, foundIds, group);
		}

		let cows = [];
		let cowsWithLastCalving = [];
		let cowsWithLastPregnant = [];
		if (limit && page) {
			cows = foundCows.slice(limit * (page - 1), limit * (page));
		} else {
			cows = foundCows;
		}
		cowsWithLastCalving = await getLastCalvingEvents(cows);
		cowsWithLastPregnant = await getLastPregnantEvents(cowsWithLastCalving);
		return res.status(200).json(getCowsResponse(cowsWithLastPregnant, cows.length));
	} catch (error) {
		const constraintError = getConstrainsError(error[0]?.constraints);
		const responseError = constraintError ? constraintError : getDefaultError(error);
		return res.status(400).json(responseError);
	}
};
/**
 * A middleware that checks if a given animal belongs to a ranch
 * @param req a request object
 * @param res a response object
 * @param next
 * @returns {Promise<*>}
 */
export const checkBelongsRanch = async (req, res, next) => {
	const repository = getRepository(FemaleBovine);
	const { ranchId } = req.params;
	try {
		const cow = await repository
			.whereEqualTo("ranchIdentifier", ranchId)
			.findOne();
		if (!cow) {
			return res.status(404).send();
		}
		next();
	} catch (_) {
		return res.status(404).send();
	}
}

/**
 * Gets a filtered array of FemaleBovines from a given ranch identifier
 * @param req a request object
 * @returns {Promise<FemaleBovine[]|*[]|FlatArray<FemaleBovine[][], 1>[]>}
 */
async function getFilteredCows(req) {
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
				.whereNotEqualTo("lactationCycle", 0)
				.whereIn("breed", filterValues).find();
		case 'DELETED':
			if (filterValues.includes('DEAD') && filterValues.includes('SOLD')) {
				let isDeadQuery = repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereNotEqualTo("lactationCycle", 0)
					.whereEqualTo('isDead', true);
				let deleteAtQuery = repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereNotEqualTo('deleteAt', null);
				const promises = [isDeadQuery.find(), deleteAtQuery.find()];
				const responses = await Promise.all(promises);
				return getOnlyCows(responses.flat());
			} else if (filterValues.includes('DEAD')) {
				return await repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereNotEqualTo("lactationCycle", 0)
					.whereEqualTo('isDead', true)
					.find();
			} else if (filterValues.includes('SOLD')) {
				const response = await repository
					.whereEqualTo("ranchIdentifier", ranchId)
					.whereNotEqualTo('deleteAt', null)
					.find();
				return getOnlyCows(response);
			}
			break;
		default:
			return [];
	}
}

/**
 * Gets all the cows with a given ranch identifier
 * @param ranchId a given ranch identifier
 * @param foundIds an array of internals ids found by algolia
 * @returns {Promise<FemaleBovine[]>}
 */
async function getAllCows(ranchId, foundIds, group) {
	const repository = getRepository(FemaleBovine);
	let query = repository.whereEqualTo("ranchIdentifier", ranchId)
		.whereEqualTo('deleteAt', null)
		.whereEqualTo("isDead", false)
		.whereGreaterThan("lactationCycle", 0);
	query = group ? query.whereEqualTo("groupIdentifier", "DEFAULT") : query;
	return foundIds.length > 0 ? await query.whereIn('internalIdentifier', foundIds).find() : await query.find();
}

function getOnlyCows(cows) {
	return cows.map(cow => {
		if (cow.lactationCycle > 0) {
			return cow;
		}
	});
}