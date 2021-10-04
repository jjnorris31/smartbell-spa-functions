import index from "../utils/algolia";
import {
	getConstrainsError,
	getDefaultError,
	DEFAULT_GROUPS,
	getLastCalvingEvents,
	getLastPregnantEvents,
	getCowsResponse,
	getTimestampByDate
} from "../utils/utils";

import {getRepository, runTransaction} from "fireorm";
import Group from "../models/group";
import FemaleBovine from "../models/femaleBovine";
import * as moment from 'moment';

export const getGroup = async (req, res) => {
	const { limit, page, filter, values, search } = req.query;
	const { ranchId, id } = req.params;

	try {
		let foundCows = [];
		let foundIds = [];

		let group = await getGroupByIdentifier(req);

		if (search) {
			const hits = await index.search(search, {
				filters: `groupIdentifier:${id} AND animalType:COW`
			});

			if (hits.hits.length > 0) {
				foundIds = hits.hits.map(hit => {
					return hit?.internalIdentifier;
				});
			} else {
				return res.status(200).json({...group, ...getCowsResponse([], 0)});
			}
		}

		if (filter && values) {
			foundCows = await getFilteredCowsByGroup(req);
			foundCows = search ? foundCows.filter(cow =>  foundIds.includes(cow.internalIdentifier)) : foundCows;
		} else {
			foundCows = await getCowsByGroup(ranchId, foundIds, id);
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
		const groupResponse = {...group, ...getCowsResponse(cowsWithLastPregnant, cows.length)};
		return res.status(200).json({...group, ...getCowsResponse(cowsWithLastPregnant, cows.length)});
	} catch (error) {
		return res.status(400).json(error);
	}
}

export const getGroups = async (req, res) => {
	const { ranchId } = req.params;
	const { type } = req.query;
	const repository = getRepository(Group);

	try {
		let groupIdentifiers = [...DEFAULT_GROUPS, ranchId];
		let groupsWithoutCount = await repository
			.whereIn("ranchIdentifier", groupIdentifiers)
			.whereEqualTo("type", type)
			.find();

		let groupCountPromises = [];

		if (type === 'COW') {
			for (let group of groupsWithoutCount) {
				groupCountPromises.push(getCowsByGroup(ranchId, [], group.id));
			}
		} else if (type === 'HEIFER') {
			for (let group of groupsWithoutCount) {
				groupCountPromises.push(getHeifersByGroup(ranchId, [], group.id));
			}
		}
		for (let group of groupsWithoutCount) {
			groupCountPromises.push(getCowsByGroup(ranchId, [], group.id));
		}
		let groupCountResponses = await Promise.all(groupCountPromises);
		let groups = [];

		groupsWithoutCount.forEach((group, index) => {
			groups.push({...group, count: groupCountResponses[index].length});
		});
		return res.status(200).json(groups);
	} catch (error) {
		console.log({error});
		return res.status(400).json(error);
	}
}

export const deleteGroup = async (req, res) => {
	const { ranchId, id } = req.params;

	if (DEFAULT_GROUPS.includes(id)) {
		return res.status(403).json({
			code: 'delete default',
			message: 'Cannot delete a default group'
		});
	}

	try {
		await runTransaction(async tran => {
			const groupTranRepository = tran.getRepository(Group);
			const femaleBovineTranRepository = tran.getRepository(FemaleBovine);

			let femaleBovinesQuery = femaleBovineTranRepository
				.whereEqualTo("ranchIdentifier", ranchId)
				.whereEqualTo('deleteAt', null)
				.whereEqualTo("isDead", false)
				.whereEqualTo("groupIdentifier", id)
				.whereGreaterThan("lactationCycle", 0);

			let femaleBovines = await femaleBovinesQuery.find();

			await groupTranRepository.delete(id);
			for (let femaleBovine of femaleBovines) {
				femaleBovine.groupIdentifier = 'DEFAULT';
				await femaleBovineTranRepository.update(femaleBovine);
			}
		});
		return res.status(204).json({});
	} catch (error) {
		return res.status(404).json(error);
	}
}

export const createGroup = async (req, res) => {
	const {
		description,
		KPI,
		name,
		animals,
		type,
	} = req.body;

	const { ranchId } = req.params;

	try {
		const group = new Group();
		group.description = description;
		group.createdAt = getTimestampByDate();
		group.name = name;
		group.type = type;
		group.KPI = KPI;
		group.ranchIdentifier = ranchId;

		let createdGroup = null;
		await runTransaction(async tran => {
			const femaleBovineTransactionRepository = tran.getRepository(FemaleBovine);
			const groupTransactionRepository = tran.getRepository(Group);
			let femaleBovinesToUpdate = [];

			for (const id of animals) {
				// todo change to promise all
				let femaleBovine = await femaleBovineTransactionRepository.findById(id);
				femaleBovinesToUpdate.push(femaleBovine);
			}

			createdGroup = await groupTransactionRepository.create(group);
			for (const femaleBovine of femaleBovinesToUpdate) {
				femaleBovine.groupIdentifier = createdGroup.id;
				await femaleBovineTransactionRepository.update(femaleBovine);
			}
		});
		return res.status(200).json(createdGroup);
	} catch (e) {
		return res.status(400).json(e);
	}
}

export const updateGroup = async (req, res) => {
	const { ranchId, id } = req.params;
	const {
		description
	} = req.body;
	const repository = getRepository(Group);

	try {
		const group = await repository.findById(id);
		group.description = description;
		await repository.update(group);
		return res.status(200).json({});
	} catch (e) {
		return res.status(209).json(e);
	}
}

export const checkUniqueGroupName = async (req, res, next) => {
	const { ranchId } = req.params;
	const { name } = req.body;
	const repository = getRepository(Group);

	try {
		const foundGroup = await repository
			.whereEqualTo("name", name)
			.whereEqualTo("ranchIdentifier", ranchId).findOne();
		if (foundGroup) {
			return res.status(209).json({
				code: "name duplicated",
				message: `a group with this name was saved previously in this ranch`,
			});
		} else {
			next();
		}
	} catch (e) {
		return res.status(200).json(
			{
				code: "checking error",
				message: `an error has occurred while checking the group's name`,
			}
		);
	}
}

export const createDefaultGroup = async (req, res) => {
	const repository = getRepository(Group);
	try {
		await repository.create({
			createdAt: getTimestampByDate(),
			description: "DEFAULT",
			KPI: "HEAT",
			name: "DEFAULT",
			id: "DEFAULT",
			ranchIdentifier: "DEFAULT",
			type: "COW"
		});
		return res.status(201).json();
	} catch (e) {
		return res.status(400).json(e);
	}
}

async function getGroupByIdentifier(req) {
	const repository = getRepository(Group);
	const {ranchId, id} = req.params;

	return await repository
		.whereEqualTo("id", id).findOne();
}

async function getFilteredCowsByGroup(req) {
	const repository = getRepository(FemaleBovine);
	const {limit, page, filter, values} = req.query;
	const {ranchId, id} = req.params;
	let filterValues = values.split(',');
	switch (filter) {
		case 'LACTATION':
			filterValues = getIntegerFilterValues(filterValues);
			return await repository
				.whereEqualTo("ranchIdentifier", ranchId)
				.whereEqualTo("isDead", false)
				.whereEqualTo('deleteAt', null)
				.whereEqualTo("groupIdentifier", id)
				.whereIn("lactationCycle", filterValues).find();
		case 'BREED':
			return await repository
				.whereEqualTo("ranchIdentifier", ranchId)
				.whereEqualTo("isDead", false)
				.whereEqualTo('deleteAt', null)
				.whereEqualTo("groupIdentifier", id)
				.whereNotEqualTo("lactationCycle", 0)
				.whereIn("breed", filterValues).find();
		case 'AGE':
			filterValues = getIntegerFilterValues(filterValues);
			const foundCows = await repository
				.whereEqualTo("ranchIdentifier", ranchId)
				.whereEqualTo("isDead", false)
				.whereEqualTo('deleteAt', null)
				.whereEqualTo("groupIdentifier", id)
				.whereNotEqualTo("lactationCycle", 0).find();
			return foundCows.filter(cow => {
				const age = moment().diff(moment(cow.birthday), 'years');
				return filterValues.includes(age);
			});
		default:
			return [];
	}
}

function getIntegerFilterValues(filterValues) {
	return filterValues = filterValues.map(value => {
		return parseInt(value);
	});
}

async function getCowsByGroup(ranchId, foundIds, id) {
	const repository = getRepository(FemaleBovine);
	let query = repository
		.whereEqualTo("ranchIdentifier", ranchId)
		.whereEqualTo('deleteAt', null)
		.whereEqualTo("isDead", false)
		.whereEqualTo("groupIdentifier", id)
		.whereGreaterThan("lactationCycle", 0);

	return foundIds.length > 0 ? await query.whereIn('internalIdentifier', foundIds).find() : await query.find();
}

async function getHeifersByGroup(ranchId, foundIds, id) {
	const repository = getRepository(FemaleBovine);
	const query = repository
		.whereEqualTo("ranchIdentifier", ranchId)
		.whereEqualTo('deleteAt', null)
		.whereEqualTo("isDead", false)
		.whereEqualTo("groupIdentifier", id)
		.whereEqualTo("lactationCycle", 0);

	return foundIds.length > 0 ? await query.whereIn('internalIdentifier', foundIds).find() : await query.find();
}