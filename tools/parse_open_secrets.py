import csv
import copy
from collection import defaultdict
import os

FILE_DIR = "/Users/zaklee/Downloads/CampaignFin16"

csv.register_dialect('open_secrets', quotechar='|')

cand_fields = ['Cycle', 'FECCandID', 'CID', 'FirstLastP', 'Party', 'DistIDRunFor', 'DistIDCurr', 'CurrCand', 'CycleCand', 'CRPICO', 'RecipCode', 'NoPacs']
indiv_fields = ['Cycle', 'FECTransID', 'ContribID', 'Contrib', 'RecipID', 'Orgname', 'UltOrg', 'RealCode', 'Date', 'Amount', 'Street', 'City', 'State', 'Zip', 'RecipCode', 'Type', 'CmteID', 'OtherID', 'Gender', 'Microfilm', 'Occupation', 'Employer', 'Source']
pac_fields = ['Cycle', 'FECRecNo', 'PACID', 'CID', 'Amount', 'Date', 'RealCode', 'Type', 'DI', 'FECCandID']
commitee_fields = ['Cycle', 'CmteID', 'PACShort', 'Affiliate', 'Ultorg', 'RecipID', 'RecipCode', 'FECCandID', 'Party', 'PrimCode', 'Source', 'Sensitive', 'Foreign']

candidate_file = "cands16.txt"
commitee_file = "cmtes16.txt"
pac_file = "pacs16.txt"
indiv_file = "indivs16.txt"

def get_amounts_by_canidate_and_category(file, fields, candidate_id_field):
	data = {}
	with open(os.path.join(FILE_DIR, file)) as fh:
		for row in csv.DictReader(fh, fields, dialect='open_secrets'):
			cid = row[candidate_id_field]
			if cid not in data:
				data[cid] = defaultdict(float)
			realcode = row['RealCode']
			data[cid][realcode] += float(row["Amount"])

	return data

def get_canidates():
	data = {}
	with open(candidate_file) as fh:

indiv_donations = get_amounts_by_canidate_and_category(indiv_file, indiv_fields, "RecipID")
pac_donations = get_amounts_by_canidate_and_category(pac_file, pac_fields, "CID")
merged_donations = copy.deepcopy(indiv_donations)

for cid, donations in pac_donations.items():
	if cid not in merged_donations:
		merged_donations[cid] = {}
	for code, amount in donations.items():
		merged_donations[cid][code] += amount

def get_options
with open("data.csv", "wb") as fh:
	csv.DictWriter()
	for in get_options()