using System.Linq;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Infrastructure
{
    public interface IAuthValidator
    {
        bool ValidateToken(AuthToken token);
    }

    public class AuthValidator: IAuthValidator
    {
        private readonly IUserRolesProvider _rolesProvider;

        public AuthValidator(IUserRolesProvider rolesProvider)
        {
            _rolesProvider = rolesProvider;
        }

        public bool ValidateToken(AuthToken token)
        {
            var passwords = _rolesProvider.GetRolePasswords(token.Role);
            return passwords.Any(x => HashCalculator.Calculate(x) == token.Token);
        }
    }
}