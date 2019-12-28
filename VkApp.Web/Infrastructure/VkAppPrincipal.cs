using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using VkApp.Data;

namespace VkApp.Web.Infrastructure
{
    class VkAppPrincipal : IPrincipal
    {
        private readonly IEnumerable<string> _roles;

        public VkAppPrincipal(string role)
        {
            Identity = new GenericIdentity(role);
            _roles = Role.GelAvailableRoles(role);
        }

        public bool IsInRole(string role)
        {
            return _roles.Any(x => x.Equals(role));
        }

        public IIdentity Identity { get; }
    }
}