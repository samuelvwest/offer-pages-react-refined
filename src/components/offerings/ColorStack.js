import React from 'react';
import { connect } from 'react-redux';
import { modifyPageSettings } from '../../actions/pageSettings';
import { LegalSup, LegalLongDurationBilledMonthly } from '../LegalText';

const mapStateToProps = (state) => {
    return {
        pageSettings: state.pageSettings,
        variables: state.variables
    }
};

const mapDispatchToProps = (dispatch) => ({
    modifyPageSettings: (modifications) => dispatch(modifyPageSettings(modifications))
});

const classesMaker = (styleName) => {
    return `container container--${styleName} offerings-style offerings-style--${styleName}`
}

const ColorStack = connect(mapStateToProps, mapDispatchToProps)((props) => {
    const pS = props.pageSettings;
    const subs = pS.subscriptions;
    const toggleTest = !!pS.LDBM && /toggle/.test(pS.LDBM);
    const sbsTest = !!pS.LDBM && /side-by-side/.test(pS.LDBM);
    return (
        <div className={classesMaker('colorstack')}>
            <form action="/checkout/mli?">
                {!!pS.returnURL && <input type="hidden" name="returnUrl" value={pS.returnURL} />}
                <input type="hidden" name="direct" value="1" />
                <input type="hidden" name="rtype" value={pS.elligibility === 'freetrial' ? '14' : '11'} />
                <input type="hidden" name="quantities" value="1" />
                <input type="hidden" name="flow" value="3" />
                <section className="pricingCon">
                    <section className="durationSelections">
                        <div className="buttonPill">
                            {subs.display.durations.map((duration) => {
                                const toggleButtonTest = duration.num > 1 && toggleTest;
                                const privateRowTest = duration.num === 1 && (sbsTest || (toggleTest && subs.display.durations.length > 3) || (subs.display.durations.length % 2) !== 0);
                                const activeTest = duration.num === subs.selectedOffer.renewMonths && (toggleButtonTest ? true : duration.ldbm === subs.selectedOffer.ldbm);
                                return (
                                    <button key={`${duration.num}MR_${duration.ldbm ? 1 : duration.num}MB`} type="button" 
                                        className={`${activeTest ? `activePill icon iconCheck` : `inactivePill`}${privateRowTest ? ` privateRow` : ``}`}
                                        onClick={() => props.modifyPageSettings({ 
                                            selectedOffer: { 
                                                renewMonths: duration.num, 
                                                packageID: pS.selectedOffer.packageID,
                                                ldbm: duration.ldbm
                                            }
                                        })}
                                    >
                                        {duration.num === 1 ? duration.text.toUpperCase() : `${duration.num} MONTHS`}
                                        {duration.num !== 1 && subs.ldbms && sbsTest && <span>paid {duration.ldbm ? `monthly` : `upfront`}</span>}
                                    </button>
                                )
                            })}
                        </div>
                        {toggleTest && subs.selectedOffer.renewMonths !== 1 && 
                            <p className="durationLDBMButton">
                                <button type="button" onClick={() => props.modifyPageSettings({LDBM: (subs.selectedOffer.ldbm ? `toggle-back` : `toggle-front`) })}>
                                    Or pay {subs.selectedOffer.ldbm ? `all ${subs.selectedOffer.renewMonths} months upfront` : `monthly`}
                                </button>
                            </p>
                        }
                    </section>
                    <section className="allOptionsCon">
                        {subs.display.packages.map((pkgData) => {
                            const offer = subs.display.offersMap.find((ofr) => {
                                const packageTest = pkgData.id === ofr.packageID;
                                const renewMonthsTest = subs.selectedOffer.renewalPeriod.renewMonths === ofr.renewalPeriod.renewMonths;
                                const ldbmTest = subs.selectedOffer.ldbm === ofr.ldbm;
                                return packageTest && renewMonthsTest && ldbmTest;
                            });
                            return (
                                <div key={`${pkgData.id}_${offer.renewalPeriod.renewMonths}MR_${offer.renewalPeriod.billMonths}BR`} className={offer.packageData.order === 3 ? `orangePackageRow` : offer.packageData.order === 2 ? `greenPackageRow` : `bluePackageRow`}>
                                    <div className="annualPriceCon priceCon ancGrid">
                                        <label className="priceLink clearfix" htmlFor={offer.id}>
                                            <input 
                                                value={offer.offerIDs[subs.offerElligibilityType]} 
                                                className="radioBtn"
                                                type="radio" 
                                                name="offers" 
                                                aria-labelledby={offer.description} 
                                            />
                                            <div className={`leftPkgImg leftPkgImg--${pkgData.id} ftlpMobileSprite ancCol w25`}>
                                                <div className="colorOverlay"></div>
                                            </div>
                                            <div className="ancCol w75">
                                                {/usdiscovery/.test(pkgData.id) && <span className="ancCol durationTxt">All U.S. records</span>}
                                                {/worldexplorer/.test(pkgData.id) && <span className="ancCol durationTxt">Everything on Ancestry</span>}
                                                {/allaccess/.test(pkgData.id) && <span className="ancCol durationTxt">Everything above, <br /><strong>plus Fold3 and Newspapers.com™ Basic<LegalSup supRef="newspapersBasic" /></strong></span>}
                                                <span className="ancCol linkArrow icon iconArrowRight"></span>
                                                <span className={`ancCol w60 priceTextCon ${offer.ldbm ? `priceTextCon--ldbm` : ``}${(offer.promoSavings && /initial/.test(pS.elligibility)) ? ` priceTextCon--promo` : ``}`}>
                                                    {!offer.ldbm && /initial/.test(pS.elligibility) && <span className="daysFree">14 DAYS FREE<br /></span>}
                                                    <span className={`${offer.ldbm ? `daysFree` : `priceTxt`}${!/initial/.test(pS.elligibility) ? ` priceTextCon__priceTxt--hardoffer` : ``}`}>
                                                        {!offer.ldbm && /initial/.test(pS.elligibility) && `then `}
                                                        {offer.promoSavings && 
                                                            <span className="strike-through-price">
                                                                {offer.currency}{!offer.ldbm ? offer.renewalPeriod.MSRP : offer.renewalPeriod.MSRPMEP}
                                                                <LegalSup supRef="promoSave" />
                                                            </span>
                                                        }
                                                        {offer.currency}{!offer.ldbm ? offer.renewalPeriod.displayPrice : `${offer.renewalPeriod.displayPriceMEP}/month`}{offer.ldbm && <LegalSup supRef="longDurationBilledMonthly" />}
                                                    </span>
                                                    {offer.ldbm && /initial/.test(pS.elligibility) && <span className="priceTxt"><br />after free trial</span>}
                                                </span> 

                                                {/* {offer.promoSavings && <span className="promoSave" ><span className="strike-through-price">{offer.currency}{!offer.ldbm ? offer.renewalPeriod.MSRP : `${offer.renewalPeriod.MSRPMEP}/mo.`}<LegalSup supRef="promoSave" /></span><br /></span>} */}
                                                
                                                {offer.renewalPeriod.renewMonths === 1 && <span className={`ancCol w40 cancelText${offer.promoSavings ? ` cancelText--promo` : ``}`}>Cancel anytime</span>}
                                                {!!offer.durationSavings && <span className={`ancCol w40 cancelText${offer.promoSavings ? ` cancelText--promo` : ``} saveText`}><strong>SAVE {offer.currency}{offer.durationSavings.display}<LegalSup supRef="durationSave" /></strong></span>}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )
                        })}
                    </section>
                </section>
            </form>
            {subs.ldbms && <LegalLongDurationBilledMonthly/>}
        </div>
    )
})

export default ColorStack;