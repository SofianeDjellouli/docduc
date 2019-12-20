import React, { PureComponent, Fragment } from "react";
import { Button, Collapse, Grid } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import {
	baseAuthRequest,
	sortByName,
	sortBy,
	handleClassPromise,
	_getInsurances as getInsurances,
	geocode,
	getPlaces,
	getMedications,
	Title,
	getConditions,
	notFirstCap,
	hasSpecialChars
} from "../../utils";
import {
	RenderCheck,
	ItemsList,
	Crop,
	RenderAuto,
	RenderRadio,
	ModalProcedure,
	ModalAllergy,
	RenderInput,
	GridForm,
	RenderPhone,
	RenderAutoClear
} from "../";
import { handlePatientData, genders, toJSONDate } from "./utils";
import "./style.css";

export class PatientProfile extends PureComponent {
	constructor(props) {
		super(props);
		const profile = handlePatientData(props);
		this.state = {
			error: "",
			loading: false,
			isNotPolicyHolder: !!Object.values(profile.prim).join("").length,
			procedureToggled: false,
			allergyToggled: false,
			profile
		};
	}

	thenState = state => new Promise(resolve => this.setState(state, resolve));

	toggleProcedure = _ =>
		this.setState(({ procedureToggled }) => ({ procedureToggled: !procedureToggled }));

	toggleAllergy = _ => this.setState(({ allergyToggled }) => ({ allergyToggled: !allergyToggled }));

	handleRemove = ({
		currentTarget: {
			dataset: { i, name }
		}
	}) =>
		this.setState(({ profile }) => {
			let remover = [...profile[name]];
			remover.splice(i, 1);
			return { profile: { ...profile, [name]: remover } };
		});

	setProfile = (changes, additional, callback) =>
		this.setState(
			({ profile }) => ({ profile: { ...profile, ...changes }, ...additional }),
			callback
		);

	handleProfile = ({ target: { name, value } }) => this.setProfile({ [name]: value });

	handleValue = name => value => this.setProfile({ [name]: value });

	handleAddress = ({ value }) => geocode(value).then(address => this.setProfile({ ...address }));

	handlePrimAddress = ({ value }) =>
		geocode(value).then(address => {
			const { lat, lng, ..._address } = address,
				addressKeys = Object.keys(_address);
			let primAddress = {};
			for (let i = 0; i < addressKeys.length; i++)
				primAddress[`prim_${addressKeys[i]}`] = address[addressKeys[i]];
			this.setState(({ profile: { prim, ...profile } }) => ({
				profile: { ...profile, prim: { ...prim, ...primAddress } }
			}));
		});

	clearAddress = _ => this.setProfile({ addressLine1: "" });
	clearPrimAddress = _ => this.handlePrim({ target: { name: "prim_addressLine1", value: "" } });

	onPicture = image_url => this.setProfile({ image_url });

	handleInsurance = ({ value, id }) => this.setProfile({ insurance_plan: { plan: value, ID: id } });

	handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

	togglePolicyHolder = _ =>
		this.setState(({ isNotPolicyHolder }) => ({ isNotPolicyHolder: !isNotPolicyHolder }));

	handlePrim = ({ target: { name, value } }) =>
		this.setState(({ profile: { prim, ...profile } }) => ({
			profile: { ...profile, prim: { ...prim, [name]: value } }
		}));

	handleCondition = ({ value }) =>
		this.setState(({ profile: { medical_history, ...profile } }) => ({
			profile: {
				...profile,
				medical_history: sortBy("condition")([...medical_history, { condition: value }])
			}
		}));

	handleMedication = ({ value }) =>
		this.setState(({ profile: { medications, ...profile } }) => ({
			profile: { ...profile, medications: sortByName([...medications, { name: value }]) }
		}));

	handleAllergy = allergy =>
		this.setState(({ profile: { allergies, ...profile } }) => ({
			allergyToggled: false,
			profile: { ...profile, allergies: sortByName([...allergies, allergy]) }
		}));

	handleProcedure = procedure =>
		this.setState(({ profile: { surgical_history, ...profile } }) => ({
			procedureToggled: false,
			profile: {
				...profile,
				surgical_history: sortBy("procedure")([...surgical_history, procedure])
			}
		}));

	clearInsurance = _ =>
		this.setState(({ profile }) => ({
			profile: {
				...profile,
				insurance_plan: { plan: "", ID: 0 },
				group_number: "",
				member_policy_number: ""
			},
			isNotPolicyHolder: false
		}));

	handleDOB = DOB => this.setProfile({ DOB });

	setError = error => this.setState({ error });

	handleSubmit = event => {
		event.preventDefault();
		const { setSnackbar, setData } = this.props,
			{ isNotPolicyHolder, error, profile } = this.state,
			{
				firstName,
				lastName,
				insurance_plan,
				medical_history,
				surgical_history,
				medications,
				allergies,
				DOB,
				prim
			} = profile,
			{ prim_firstName, prim_lastName } = prim;
		let names = [
			firstName,
			lastName,
			...(isNotPolicyHolder ? [prim_firstName, prim_lastName] : [])
		];
		for (let i = 0; i < names.length; i++) {
			let name = names[i].split(/-|'| /).filter(Boolean);
			for (let j = 0; j < name.length; j++)
				if (notFirstCap(name[j]))
					return this.setError("Only the first letter of names may be capitalized.");
			if (names[i] && hasSpecialChars(names[i]))
				return this.setError("Names can't include special characters.");
		}

		const primKeys = Object.keys(prim);
		let _prim = { ...prim };
		for (let i = 0; i < primKeys.length; i++) if (!isNotPolicyHolder) _prim[primKeys[i]] = "";

		handleClassPromise(
			_ =>
				baseAuthRequest
					.post("patient_update", {
						...profile,
						..._prim,
						firstName,
						lastName,
						DOB: toJSONDate(DOB),
						insurance_plan: parseInt(insurance_plan.ID),
						condition: medical_history.map(e => e.condition),
						procedure: surgical_history.map(e => e.procedure),
						proc_date: surgical_history.map(e => toJSONDate(e.date)),
						medication: medications.map(e => e.name),
						allergy: allergies.map(e => e.name),
						reaction: allergies.map(e => e.reaction)
					})
					.then(({ data }) => {
						setSnackbar({ type: 0, message: "You have successfully updated your profile." });
						setData(data);
						if (error) this.setState({ error: "" });
						localStorage.setItem("user_picture", profile.image_url);
					}),
			loading => this.thenState({ loading })
		);
	};

	handleName = (name, props) => ({
		name,
		"aria-label": name,
		id: name,
		value: this.state.profile[name],
		onChange: this.handleProfile,
		...props
	});

	handlePrimName = name =>
		this.handleName(name, {
			onChange: this.handlePrim,
			value: this.state.profile.prim[name]
		});

	render() {
		const {
			onPicture,
			state: {
				isNotPolicyHolder,
				allergyToggled,
				procedureToggled,
				loading,
				error,
				profile: {
					DOB,
					medical_history,
					surgical_history,
					insurance_plan: { plan, ID },
					addressLine1,
					image_url,
					medications,
					allergies,
					gender,
					prim: { prim_addressLine1, relationship }
				}
			}
		} = this;
		return (
			<Grid item sm={6}>
				<GridForm onSubmit={this.handleSubmit} className="edit-profile-form">
					<Grid item xs={12}>
						{Title("Contact info")}
					</Grid>
					<RenderInput required autoFocus label="First name" {...this.handleName("firstName")} />
					<RenderInput required label="Last name" {...this.handleName("lastName")} />
					<Grid item xs={12}>
						<label className="form-label" htmlFor="DOB">
							Date of birth *
						</label>
						<DatePicker
							fullWidth
							disableFuture
							openTo="year"
							format="MM/DD/YYYY"
							id="DOB"
							views={["year", "month", "date"]}
							value={DOB}
							onChange={this.handleDOB}
							inputProps={{ required: true, className: "form-input" }}
							InputProps={{ disableUnderline: true }}
						/>
					</Grid>
					<RenderRadio label="Gender" control={genders} {...this.handleName("gender")} />
					<RenderPhone required label="Phone" {...this.handleName("phone")} />
					<RenderAutoClear
						required
						sm={12}
						label="Practice address"
						getData={getPlaces}
						title={addressLine1}
						handleClick={this.handleAddress}
						onClear={this.clearAddress}
					/>
					<RenderInput label="Apt/Suite" {...this.handleName("addressLine2")} />
					<RenderInput required label="City" {...this.handleName("city")} />
					<RenderInput required label="State" {...this.handleName("state")} />
					<RenderInput label="Zip" {...this.handleName("zip")} />
					<Grid item xs={12} element="label" className="form-label">
						Profile Picture
					</Grid>
					<Crop src={image_url || `/img/patient${gender || "Male"}.svg`} {...{ onPicture }} />
					<Grid item xs={12}>
						{Title("Insurance info")}
					</Grid>
					<RenderAutoClear
						label="Insurance plan"
						sm={12}
						strainer={plan}
						getData={getInsurances}
						title={plan}
						handleClick={this.handleInsurance}
						onClear={this.clearInsurance}
					/>
					{!!ID && (
						<Fragment>
							<RenderInput label="Policy number" {...this.handleName("member_policy_number")} />
							<RenderInput label="Group number" {...this.handleName("group_number")} />
							<RenderCheck
								checkLabel="Are you the policy holder?"
								{...this.handleName("isNotPolicyHolder")}
								onChange={this.togglePolicyHolder}
							/>
						</Fragment>
					)}
					<Collapse in={isNotPolicyHolder}>
						<div>
							<div className="policy-subtitle">Policy holder info</div>
							<hr />
							<RenderInput
								label="First name"
								{...this.handleName("prim_firstName")}
								onChange={this.handlePrim}
							/>
							<RenderInput label="First name" {...this.handlePrimName("prim_lastName")} />
							<div className="row">
								<div className="col-xs-6">
									<p>Relation to patient</p>
									<select
										className="form-control"
										name="relationship"
										value={relationship}
										onChange={this.handlePrim}>
										{["", "Guardian", "Partner", "Child", "Other"].map(e => (
											<option value={e} key={e}>
												{e}
											</option>
										))}
									</select>
								</div>
								<RenderPhone label="Phone" {...this.handlePrimName("prim_phone")} />
							</div>
							<RenderAutoClear
								sm={12}
								label="Address"
								getData={getPlaces}
								title={prim_addressLine1}
								handleClick={this.handlePrimAddress}
								onClear={this.clearPrimAddress}
							/>
							<RenderInput label="Apt/Suite" {...this.handlePrimName("prim_addressLine2")} />
							<RenderInput required label="City" {...this.handlePrimName("prim_city")} />
							<RenderInput required label="State" {...this.handlePrimName("prim_state")} />
							<RenderInput label="Zip" {...this.handlePrimName("prim_zip")} />
						</div>
					</Collapse>
					<Grid item xs={12}>
						{Title("Medical info")}
					</Grid>
					<RenderAuto
						setValueOnClick={false}
						strainer={medical_history}
						label="Conditions"
						placeholder="Search"
						className="form-input"
						sm={12}
						getData={getConditions}
						handleClick={this.handleCondition}
					/>
					<ItemsList
						primary="condition"
						name="medical_history"
						onRemove={this.handleRemove}
						items={medical_history}
					/>
					<p>
						Procedures
						<Button className="left" onClick={this.toggleProcedure} color="primary">
							Add
						</Button>
					</p>
					<ItemsList
						primary="procedure"
						secondary="date"
						name="surgical_history"
						onRemove={this.handleRemove}
						items={surgical_history}
					/>
					<p>Medications</p>
					<RenderAuto
						setValueOnClick={false}
						label="Medications"
						placeholder="Search"
						className="form-input"
						sm={12}
						strainer={medications}
						getData={getMedications}
						handleClick={this.handleMedication}
					/>
					<ItemsList name="medications" onRemove={this.handleRemove} items={medications} />
					<p>
						Allergies
						<Button className="left" onClick={this.toggleAllergy} color="primary">
							Add
						</Button>
					</p>
					<ItemsList
						name="allergies"
						onRemove={this.handleRemove}
						secondary="reaction"
						items={allergies}
					/>
					<div className="flex-center">
						<button
							style={{ marginTop: 20 }}
							type="submit"
							className="btn softo-solid-btn pull-right"
							disabled={loading}>
							{loading && <i className="fas fa-circle-notch fa-spin right" />}
							Save
						</button>
					</div>
					{error && <div className="error">{error}</div>}
				</GridForm>
				<ModalAllergy
					open={allergyToggled}
					onClose={this.toggleAllergy}
					onAllergy={this.handleAllergy}
				/>
				<ModalProcedure
					onProcedure={this.handleProcedure}
					open={procedureToggled}
					onClose={this.toggleProcedure}
				/>
			</Grid>
		);
	}
}
