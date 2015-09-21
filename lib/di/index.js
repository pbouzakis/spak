import SpecRegistration from "./SpecRegistration";
import CondSpecs from "./CondSpecs";
import SpecFromFn from "./SpecFromFn";
import SpecFromClass from "./SpecFromClass";
import SpecFromValue from "./SpecFromValue";
import ConfigMod from "./ConfigMod";
import SpecWithConfigMod from "./SpecWithConfigMod";
import ActionSpec from "./ActionSpec";
import HooksSpec from "./HooksSpec";
import RegistrySpec from "./RegistrySpec";
import SpecRef from "./SpecRef";

var SpecGroup = SpecRegistration; // Alias for semantics.

export { SpecRegistration, SpecGroup, CondSpecs, SpecRef,
         SpecFromFn, SpecFromClass, SpecFromValue,
         ConfigMod, SpecWithConfigMod,
         ActionSpec, HooksSpec, RegistrySpec };
